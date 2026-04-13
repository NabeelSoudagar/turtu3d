import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        vendor: resolve(__dirname, 'vendor.html'),
        rider: resolve(__dirname, 'rider.html'),
        interns: resolve(__dirname, 'interns.html'),
      },
    },
  },
});
