import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { generateManifest } from './scripts/portfolio-media.mjs';

export default defineConfig({
  base: './',
  plugins: [{ name: 'portfolio-manifest', buildStart: () => generateManifest() }],
  build: { rollupOptions: { input: {
    main: fileURLToPath(new URL('./index.html', import.meta.url)),
    about: fileURLToPath(new URL('./about/index.html', import.meta.url)),
    portfolio: fileURLToPath(new URL('./portfolio/index.html', import.meta.url)),
  } } },
});
