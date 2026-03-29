import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X, Building2 } from "lucide-react";
import { useInspector } from "../contexts/InspectorContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const INDUSTRIES = ["Technology", "E-Commerce", "Healthcare", "Finance", "Real Estate", "Education", "Retail", "Agency", "Other"];

function ClientModal({ client, onClose, onSave }) {
  const [name, setName] = useState(client?.name || "");
  const [industry, setIndustry] = useState(client?.industry || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (client?.id) {
        await axios.put(`${API}/clients/${client.id}`, { name, industry }, { withCredentials: true });
        toast.success("Client updated");
      } else {
        await axios.post(`${API}/clients`, { name, industry }, { withCredentials: true });
        toast.success("Client created");
      }
      onSave();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div data-testid="client-modal" className="bg-white border border-gray-200 rounded-sm shadow-lg w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-sans text-sm font-semibold text-gray-900">{client ? "Edit Client" : "New Client"}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Client name *</label>
            <input
              data-testid="client-name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Acme Corp"
              required
              className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block font-sans text-xs font-medium text-gray-700 mb-1">Industry</label>
            <select
              data-testid="client-industry-select"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full font-mono text-sm px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 text-sm font-sans text-gray-600 rounded-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              data-testid="client-save-btn"
              disabled={loading}
              className="flex-1 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const { setContent } = useInspector();

  const fetchClients = async () => {
    try {
      const { data } = await axios.get(`${API}/clients`, { withCredentials: true });
      setClients(data);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    setContent(
      <div className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">
          {selectedClient ? "CLIENT INFO" : "CLIENTS"}
        </p>
        {selectedClient ? (
          <div className="space-y-3">
            <div>
              <p className="font-mono text-[10px] text-gray-400">name</p>
              <p className="font-mono text-xs text-gray-700 font-medium">{selectedClient.name}</p>
            </div>
            {selectedClient.industry && (
              <div>
                <p className="font-mono text-[10px] text-gray-400">industry</p>
                <p className="font-mono text-xs text-gray-700">{selectedClient.industry}</p>
              </div>
            )}
            <div>
              <p className="font-mono text-[10px] text-gray-400">created</p>
              <p className="font-mono text-xs text-gray-700">{selectedClient.created_at ? new Date(selectedClient.created_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        ) : (
          <p className="font-mono text-[10px] text-gray-400">Click a client to inspect properties.</p>
        )}
      </div>
    );
    return () => setContent(null);
  }, [selectedClient, setContent]);

  const handleDelete = async (cid) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await axios.delete(`${API}/clients/${cid}`, { withCredentials: true });
      toast.success("Client deleted");
      fetchClients();
    } catch {
      toast.error("Failed to delete client");
    }
  };

  return (
    <div className="p-6 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sans text-xl font-semibold text-gray-900">Clients</h1>
          <p className="font-mono text-xs text-gray-400 mt-0.5">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setEditClient(null); setModalOpen(true); }}
          data-testid="add-client-btn"
          className="flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
        >
          <Plus size={14} /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><p className="font-mono text-xs text-gray-400">Loading...</p></div>
      ) : clients.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-sm p-10 text-center">
          <Building2 size={24} className="text-gray-300 mx-auto mb-3" />
          <p className="font-sans text-sm text-gray-500 mb-4">No clients yet. Add your first client to start creating reports.</p>
          <button
            onClick={() => setModalOpen(true)}
            data-testid="add-first-client-btn"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-white text-sm font-medium rounded-sm hover:bg-[#0891b2] transition-colors"
          >
            <Plus size={14} /> Add First Client
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <table className="w-full text-sm" data-testid="clients-table">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Client Name", "Industry", "Created", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr
                  key={c.id}
                  data-testid={`client-row-${c.id}`}
                  onClick={() => setSelectedClient(c)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedClient?.id === c.id ? "bg-cyan-50/50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                        <span className="font-mono text-[10px] text-cyan-700">{c.name[0]}</span>
                      </div>
                      <span className="font-sans text-sm font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-gray-500">{c.industry || "—"}</span></td>
                  <td className="px-4 py-3"><span className="font-mono text-xs text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { setEditClient(c); setModalOpen(true); }}
                        data-testid={`edit-client-${c.id}`}
                        className="text-gray-400 hover:text-cyan-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        data-testid={`delete-client-${c.id}`}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ClientModal
          client={editClient}
          onClose={() => setModalOpen(false)}
          onSave={fetchClients}
        />
      )}
    </div>
  );
}
