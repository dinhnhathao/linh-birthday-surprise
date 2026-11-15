import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Use relative asset paths so the build works on GitHub Pages project URLs.
export default defineConfig({ plugins: [react()], base: './' });
