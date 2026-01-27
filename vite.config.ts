import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and core dependencies - check first
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router/')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/lucide-react') || 
              id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          // All other node_modules - but exclude already matched
          if (id.includes('node_modules/') && 
              !id.includes('node_modules/react') && 
              !id.includes('node_modules/lucide-react') && 
              !id.includes('node_modules/@radix-ui') && 
              !id.includes('node_modules/firebase')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
