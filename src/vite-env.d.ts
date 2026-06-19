/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_USE_FIREBASE_EMULATORS?: string;
  readonly VITE_MAKE_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'jspdf-autotable' {
  import type { jsPDF } from 'jspdf';
  function autoTable(doc: jsPDF, options: Record<string, unknown>): void;
  export default autoTable;
}
