import { create } from 'zustand';

interface DocumentState {
  isDocumentUploaded: boolean;
  setDocumentUploaded: (status: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  isDocumentUploaded: false,
  setDocumentUploaded: (status) => set({ isDocumentUploaded: status }),
}));