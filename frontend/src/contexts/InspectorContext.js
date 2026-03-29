import { createContext, useState, useContext, useCallback } from "react";

export const InspectorContext = createContext({ content: null, setContent: () => {} });

export function InspectorProvider({ children }) {
  const [content, setContentState] = useState(null);
  const setContent = useCallback((c) => setContentState(c), []);
  return (
    <InspectorContext.Provider value={{ content, setContent }}>
      {children}
    </InspectorContext.Provider>
  );
}

export function useInspector() {
  return useContext(InspectorContext);
}
