import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração do Vite: servidor de desenvolvimento na porta 5173.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
