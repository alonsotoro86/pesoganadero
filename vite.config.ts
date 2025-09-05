import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Configuración para acceso móvil
    server: {
      host: '0.0.0.0', // Permite acceso desde cualquier IP
      port: 5173, // Puerto por defecto de Vite
      https: false, // HTTP para desarrollo local
      cors: true, // Habilitar CORS
      hmr: {
        host: '10.217.109.174' // Tu IP local para Hot Module Replacement
      },
      // Permitir hosts externos para localtunnel
      allowedHosts: [
        'localhost',
        '10.217.109.174',
        '.loca.lt', // Permite cualquier subdominio de localtunnel
        'empty-dryers-fry.loca.lt' // Host específico de localtunnel
      ]
    }
  };
});
