import { useState, useCallback } from "react";
import type { WorkspaceDocument, WorkspaceSheet } from "@/data/workspaceMockData";
import { SEED_DOCUMENTS, SEED_SHEETS } from "@/data/workspaceMockData";

const DOCS_KEY = "thinkhub_workspace_documents";
const SHEETS_KEY = "thinkhub_workspace_sheets";

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {}
  return fallback;
}

function save<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function useDocumentStorage() {
  const [documents, setDocuments] = useState<WorkspaceDocument[]>(() =>
    load<WorkspaceDocument>(DOCS_KEY, SEED_DOCUMENTS)
  );

  const saveDocuments = useCallback((docs: WorkspaceDocument[]) => {
    setDocuments(docs);
    save(DOCS_KEY, docs);
  }, []);

  const upsertDocument = useCallback((doc: WorkspaceDocument) => {
    setDocuments(prev => {
      const exists = prev.some(d => d.id === doc.id);
      const next = exists
        ? prev.map(d => d.id === doc.id ? doc : d)
        : [doc, ...prev];
      save(DOCS_KEY, next);
      return next;
    });
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      save(DOCS_KEY, next);
      return next;
    });
  }, []);

  return { documents, saveDocuments, upsertDocument, deleteDocument };
}

export function useSheetStorage() {
  const [sheets, setSheets] = useState<WorkspaceSheet[]>(() =>
    load<WorkspaceSheet>(SHEETS_KEY, SEED_SHEETS)
  );

  const upsertSheet = useCallback((sheet: WorkspaceSheet) => {
    setSheets(prev => {
      const exists = prev.some(s => s.id === sheet.id);
      const next = exists
        ? prev.map(s => s.id === sheet.id ? sheet : s)
        : [sheet, ...prev];
      save(SHEETS_KEY, next);
      return next;
    });
  }, []);

  const deleteSheet = useCallback((id: string) => {
    setSheets(prev => {
      const next = prev.filter(s => s.id !== id);
      save(SHEETS_KEY, next);
      return next;
    });
  }, []);

  return { sheets, upsertSheet, deleteSheet };
}
