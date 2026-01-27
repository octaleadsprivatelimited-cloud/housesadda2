import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Explicit base path for deployment
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
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }
          // Firebase
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          // Large utilities
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Ensure proper asset handling
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'esbuild', // Use esbuild (faster and built-in) instead of terser
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
