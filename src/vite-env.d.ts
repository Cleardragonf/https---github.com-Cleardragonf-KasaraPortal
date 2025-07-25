/// <reference types="vite/client" />
interface ImportMetaEnv {
    VITE_FRONTEND_URL: string;
    VITE_BACKEND_URL: string;
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}