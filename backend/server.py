from dotenv import load_dotenv
load_dotenv()

import os
import bcrypt
import jwt
import io
import math
import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any, Annotated, Dict
from collections import defaultdict

from fastapi import FastAPI, APIRouter, HTTPException, Request, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from bson import ObjectId
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = mongo_client[os.environ["DB_NAME"]]

app = FastAPI(title="ReportBridge API")
api_router = APIRouter(prefix="/api")

_raw_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
cors_origins = [o.strip() for o in _raw_origins.split(",") if o.strip() and o.strip() != "*"]
if not cors_origins:
    cors_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth ──────────────────────────────────────────────────────────────────────
JWT_ALG = "HS256"

def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def make_access_token(uid: str, email: str) -> str:
    return jwt.encode(
        {"sub": uid, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=8), "type": "access"},
        _jwt_secret(), JWT_ALG
    )

def make_refresh_token(uid: str) -> str:
    return jwt.encode(
        {"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"},
        _jwt_secret(), JWT_ALG
    )

def _set_auth_cookies(resp: JSONResponse, uid: str, email: str):
    resp.set_cookie("access_token", make_access_token(uid, email), httponly=True, secure=False, samesite="lax", max_age=28800, path="/")
    resp.set_cookie("refresh_token", make_refresh_token(uid), httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "):
            token = ah[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        return {"_id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ── Request Models ────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ClientCreate(BaseModel):
    name: str
    industry: Optional[str] = None

class ReportCreate(BaseModel):
    client_id: str
    name: str

class MappingRequest(BaseModel):
    mapping: Dict[str, str]
    save_as_template: Optional[str] = None

class SummaryUpdate(BaseModel):
    summary: str

class TemplateCreate(BaseModel):
    name: str
    column_mapping: Dict[str, str]

# ── Auth Endpoints ────────────────────────────────────────────────────────────
@api_router.post("/auth/register")
async def register(data: RegisterRequest):
    email = data.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    res = await db.users.insert_one({
        "email": email, "name": data.name,
        "password_hash": hash_pw(data.password),
        "role": "user", "created_at": datetime.now(timezone.utc).isoformat()
    })
    uid = str(res.inserted_id)
    resp = JSONResponse({"id": uid, "email": email, "name": data.name, "role": "user"})
    _set_auth_cookies(resp, uid, email)
    return resp

@api_router.post("/auth/login")
async def login(data: LoginRequest):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_pw(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    uid = str(user["_id"])
    resp = JSONResponse({"id": uid, "email": email, "name": user.get("name", ""), "role": user.get("role", "user")})
    _set_auth_cookies(resp, uid, email)
    return resp

@api_router.post("/auth/logout")
async def logout():
    resp = JSONResponse({"message": "Logged out"})
    resp.delete_cookie("access_token")
    resp.delete_cookie("refresh_token")
    return resp

@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh_token_endpoint(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(401, "User not found")
        uid = str(user["_id"])
        resp = JSONResponse({"message": "Token refreshed"})
        resp.set_cookie("access_token", make_access_token(uid, user["email"]), httponly=True, secure=False, samesite="lax", max_age=28800, path="/")
        return resp
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")

# ── Client Endpoints ──────────────────────────────────────────────────────────
def _fmt_client(doc: dict) -> dict:
    return {"id": str(doc["_id"]), "name": doc["name"], "industry": doc.get("industry"), "created_at": doc.get("created_at")}

@api_router.get("/clients")
async def list_clients(user=Depends(get_current_user)):
    docs = await db.clients.find({"user_id": user["_id"]}).to_list(100)
    return [_fmt_client(d) for d in docs]

@api_router.post("/clients")
async def create_client(data: ClientCreate, user=Depends(get_current_user)):
    doc = {"user_id": user["_id"], "name": data.name, "industry": data.industry, "created_at": datetime.now(timezone.utc).isoformat()}
    res = await db.clients.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _fmt_client(doc)

@api_router.put("/clients/{cid}")
async def update_client(cid: str, data: ClientCreate, user=Depends(get_current_user)):
    await db.clients.update_one({"_id": ObjectId(cid), "user_id": user["_id"]}, {"$set": {"name": data.name, "industry": data.industry}})
    return {"id": cid, "name": data.name, "industry": data.industry}

@api_router.delete("/clients/{cid}")
async def delete_client(cid: str, user=Depends(get_current_user)):
    await db.clients.delete_one({"_id": ObjectId(cid), "user_id": user["_id"]})
    return {"message": "Deleted"}

# ── Report Endpoints ──────────────────────────────────────────────────────────
def _fmt_report(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "client_id": doc.get("client_id"),
        "client_name": doc.get("client_name"),
        "name": doc.get("name"),
        "status": doc.get("status", "draft"),
        "csv_files": [{"filename": f["filename"], "headers": f.get("headers", []), "row_count": f.get("row_count", 0)} for f in doc.get("csv_files", [])],
        "column_mapping": doc.get("column_mapping"),
        "kpi_data": doc.get("kpi_data"),
        "chart_data": doc.get("chart_data"),
        "summary": doc.get("summary"),
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
    }

@api_router.get("/reports")
async def list_reports(client_id: Optional[str] = None, user=Depends(get_current_user)):
    q = {"user_id": user["_id"]}
    if client_id:
        q["client_id"] = client_id
    docs = await db.reports.find(q).sort("created_at", -1).to_list(100)
    return [_fmt_report(d) for d in docs]

@api_router.post("/reports")
async def create_report(data: ReportCreate, user=Depends(get_current_user)):
    client = await db.clients.find_one({"_id": ObjectId(data.client_id)})
    if not client:
        raise HTTPException(404, "Client not found")
    doc = {
        "user_id": user["_id"], "client_id": data.client_id,
        "client_name": client["name"], "name": data.name,
        "status": "draft", "csv_files": [], "column_mapping": None,
        "kpi_data": None, "chart_data": None, "summary": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    res = await db.reports.insert_one(doc)
    doc["_id"] = res.inserted_id
    return _fmt_report(doc)

@api_router.get("/reports/{rid}")
async def get_report(rid: str, user=Depends(get_current_user)):
    doc = await db.reports.find_one({"_id": ObjectId(rid), "user_id": user["_id"]})
    if not doc:
        raise HTTPException(404, "Report not found")
    return _fmt_report(doc)

@api_router.delete("/reports/{rid}")
async def delete_report(rid: str, user=Depends(get_current_user)):
    await db.reports.delete_one({"_id": ObjectId(rid), "user_id": user["_id"]})
    return {"message": "Deleted"}

@api_router.post("/reports/{rid}/upload-csv")
async def upload_csv(rid: str, files: List[UploadFile] = File(...), user=Depends(get_current_user)):
    csv_files = []
    for f in files:
        content = await f.read()
        try:
            df = pd.read_csv(io.BytesIO(content))
            df = df.where(pd.notna(df), None)
            rows = []
            for row in df.to_dict(orient="records")[:500]:
                clean = {}
                for k, v in row.items():
                    if v is None or (isinstance(v, float) and math.isnan(v)):
                        clean[k] = None
                    elif isinstance(v, (int, float, bool)):
                        clean[k] = v
                    else:
                        clean[k] = str(v)
                rows.append(clean)
            csv_files.append({"filename": f.filename, "headers": list(df.columns), "rows": rows, "row_count": len(df)})
        except Exception as e:
            raise HTTPException(400, f"Failed to parse {f.filename}: {e}")
    await db.reports.update_one(
        {"_id": ObjectId(rid), "user_id": user["_id"]},
        {"$set": {"csv_files": csv_files, "status": "uploaded", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"csv_files": [{"filename": f["filename"], "headers": f["headers"], "row_count": f["row_count"]} for f in csv_files]}

@api_router.post("/reports/{rid}/map-columns")
async def map_columns(rid: str, data: MappingRequest, user=Depends(get_current_user)):
    if not await db.reports.find_one({"_id": ObjectId(rid), "user_id": user["_id"]}):
        raise HTTPException(404, "Report not found")
    await db.reports.update_one(
        {"_id": ObjectId(rid)},
        {"$set": {"column_mapping": data.mapping, "status": "mapped", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if data.save_as_template:
        await db.templates.insert_one({
            "user_id": user["_id"], "name": data.save_as_template,
            "column_mapping": data.mapping, "created_at": datetime.now(timezone.utc).isoformat()
        })
    return {"message": "Mapping saved", "mapping": data.mapping}

@api_router.post("/reports/{rid}/generate")
async def generate_report(rid: str, user=Depends(get_current_user)):
    doc = await db.reports.find_one({"_id": ObjectId(rid), "user_id": user["_id"]})
    if not doc:
        raise HTTPException(404, "Report not found")
    mapping = doc.get("column_mapping")
    if not mapping:
        raise HTTPException(400, "Map columns first")
    all_rows = [r for f in doc.get("csv_files", []) for r in f.get("rows", [])]
    if not all_rows:
        raise HTTPException(400, "No CSV data found")

    def safe_n(v):
        try:
            return float(str(v).replace(",", "").replace("$", ""))
        except:
            return 0.0

    sc, lc, rc, dc = mapping.get("spend"), mapping.get("leads"), mapping.get("revenue"), mapping.get("date")
    ts = sum(safe_n(r.get(sc, 0)) for r in all_rows if sc and r.get(sc) is not None)
    tl = sum(safe_n(r.get(lc, 0)) for r in all_rows if lc and r.get(lc) is not None)
    tr = sum(safe_n(r.get(rc, 0)) for r in all_rows if rc and r.get(rc) is not None)

    kpi_data = {
        "total_spend": round(ts, 2), "total_leads": int(tl),
        "total_revenue": round(tr, 2),
        "cpl": round(ts / tl, 2) if tl > 0 else 0,
        "roas": round(tr / ts, 2) if ts > 0 else 0
    }
    chart_data = []
    if dc:
        daily: Dict[str, Dict] = defaultdict(lambda: {"spend": 0.0, "leads": 0, "revenue": 0.0})
        for row in all_rows:
            d = str(row.get(dc, "Unknown"))
            if sc and row.get(sc) is not None:
                daily[d]["spend"] += safe_n(row.get(sc, 0))
            if lc and row.get(lc) is not None:
                daily[d]["leads"] += int(safe_n(row.get(lc, 0)))
            if rc and row.get(rc) is not None:
                daily[d]["revenue"] += safe_n(row.get(rc, 0))
        chart_data = [{"date": k, **v} for k, v in sorted(daily.items())][:30]

    await db.reports.update_one(
        {"_id": ObjectId(rid)},
        {"$set": {"kpi_data": kpi_data, "chart_data": chart_data, "status": "complete", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"kpi_data": kpi_data, "chart_data": chart_data}

@api_router.put("/reports/{rid}/summary")
async def update_summary(rid: str, data: SummaryUpdate, user=Depends(get_current_user)):
    await db.reports.update_one(
        {"_id": ObjectId(rid), "user_id": user["_id"]},
        {"$set": {"summary": data.summary, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Updated"}

# ── Template Endpoints ────────────────────────────────────────────────────────
@api_router.get("/templates")
async def list_templates(user=Depends(get_current_user)):
    docs = await db.templates.find({"user_id": user["_id"]}).to_list(100)
    return [{"id": str(d["_id"]), "name": d["name"], "column_mapping": d.get("column_mapping", {}), "created_at": d.get("created_at")} for d in docs]

@api_router.post("/templates")
async def create_template(data: TemplateCreate, user=Depends(get_current_user)):
    doc = {"user_id": user["_id"], "name": data.name, "column_mapping": data.column_mapping, "created_at": datetime.now(timezone.utc).isoformat()}
    res = await db.templates.insert_one(doc)
    return {"id": str(res.inserted_id), "name": data.name, "column_mapping": data.column_mapping}

@api_router.delete("/templates/{tid}")
async def delete_template(tid: str, user=Depends(get_current_user)):
    await db.templates.delete_one({"_id": ObjectId(tid), "user_id": user["_id"]})
    return {"message": "Deleted"}

# ── App ───────────────────────────────────────────────────────────────────────
app.include_router(api_router)

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# ── Startup / Seed ────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@reportbridge.io")
    admin_pw = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({"email": admin_email, "name": "Admin", "password_hash": hash_pw(admin_pw), "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_pw(admin_pw, existing_admin["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_pw(admin_pw)}})

    demo_email = "demo@reportbridge.io"
    if not await db.users.find_one({"email": demo_email}):
        res = await db.users.insert_one({"email": demo_email, "name": "Demo User", "password_hash": hash_pw("demo1234"), "role": "user", "created_at": datetime.now(timezone.utc).isoformat()})
        await _seed_demo(str(res.inserted_id))

    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n## Admin\n- Email: admin@reportbridge.io\n- Password: admin123\n\n## Demo User\n- Email: demo@reportbridge.io\n- Password: demo1234\n\n## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n")
    logger.info("ReportBridge API started")

async def _seed_demo(uid: str):
    weeks = ["Jan W1","Jan W2","Jan W3","Jan W4","Feb W1","Feb W2","Feb W3","Feb W4","Mar W1","Mar W2","Mar W3","Mar W4"]

    def gen_chart(base_s, base_l, base_r, seed_offset=0):
        data = []
        for i, w in enumerate(weeks):
            random.seed(i * 17 + seed_offset)
            m = 1.0 + (i * 0.015) + random.uniform(-0.08, 0.1)
            data.append({"date": w, "spend": round(base_s * m, 2), "leads": max(1, int(base_l * m)), "revenue": round(base_r * m, 2)})
        return data

    def calc_kpis(cd):
        ts = sum(d["spend"] for d in cd)
        tl = sum(d["leads"] for d in cd)
        tr = sum(d["revenue"] for d in cd)
        return {"total_spend": round(ts, 2), "total_leads": tl, "total_revenue": round(tr, 2), "cpl": round(ts/tl, 2) if tl else 0, "roas": round(tr/ts, 2) if ts else 0}

    c1 = await db.clients.insert_one({"user_id": uid, "name": "Acme Digital", "industry": "Technology", "created_at": datetime.now(timezone.utc).isoformat()})
    c2 = await db.clients.insert_one({"user_id": uid, "name": "Bloom Retail", "industry": "E-Commerce", "created_at": datetime.now(timezone.utc).isoformat()})

    acme_cd = gen_chart(3750, 104, 15000, 0)
    bloom_cd = gen_chart(2375, 70, 7917, 100)

    now = datetime.now(timezone.utc).isoformat()
    await db.reports.insert_one({
        "user_id": uid, "client_id": str(c1.inserted_id), "client_name": "Acme Digital",
        "name": "Q1 2024 Performance Report", "status": "complete",
        "csv_files": [], "column_mapping": {"date": "date", "spend": "spend", "leads": "leads", "revenue": "revenue"},
        "kpi_data": calc_kpis(acme_cd), "chart_data": acme_cd,
        "summary": "Q1 2024 showed strong performance with consistent lead generation across all weeks. Spend efficiency improved month-over-month with ROAS exceeding targets.",
        "created_at": now, "updated_at": now
    })
    await db.reports.insert_one({
        "user_id": uid, "client_id": str(c2.inserted_id), "client_name": "Bloom Retail",
        "name": "Q1 2024 Campaign Summary", "status": "complete",
        "csv_files": [], "column_mapping": {"date": "date", "spend": "spend", "leads": "leads", "revenue": "revenue"},
        "kpi_data": calc_kpis(bloom_cd), "chart_data": bloom_cd,
        "summary": "Bloom Retail Q1 campaigns delivered solid returns with CPL well within budget. Revenue growth accelerated in March following campaign optimization.",
        "created_at": now, "updated_at": now
    })
    logger.info("Demo data seeded for user %s", uid)

@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()
