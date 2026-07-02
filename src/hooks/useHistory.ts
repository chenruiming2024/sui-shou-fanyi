import { useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";

export function useHistory() {
  const store = useHistoryStore();
  useEffect(() => { store.fetch(); }, []);
  return store;
}