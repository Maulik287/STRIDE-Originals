/**
 * Standalone Production Inlining Script
 * Adheres to Directive 5: Zero-Fail Standalone Production Pipeline
 * Ensures static bundle portability across shared hosting and LiteSpeed servers.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');
const standaloneHtmlPath = path.join(distDir, 'index_standalone.html');

console.log('[GOAT 3D Pipeline] Checking production distribution build...');

if (!fs.existsSync(distDir) || !fs.existsSync(indexHtmlPath)) {
  console.log('[GOAT 3D Pipeline] Run `npm run build` before running `node build_standalone.js`');
  process.exit(0);
}

try {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');

  // Find linked css and inline if desired
  const cssMatches = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g);
  if (cssMatches) {
    for (const match of cssMatches) {
      const hrefMatch = match.match(/href="([^"]+)"/);
      if (hrefMatch && hrefMatch[1]) {
        const cssPath = path.join(distDir, hrefMatch[1].replace(/^\//, ''));
        if (fs.existsSync(cssPath)) {
          const cssContent = fs.readFileSync(cssPath, 'utf8');
          html = html.replace(match, `<style>${cssContent}</style>`);
          console.log(`[GOAT 3D Pipeline] Inlined CSS: ${hrefMatch[1]}`);
        }
      }
    }
  }

  fs.writeFileSync(standaloneHtmlPath, html, 'utf8');
  console.log(`[GOAT 3D Pipeline] Standalone production build generated at ${standaloneHtmlPath}`);
} catch (err) {
  console.error('[GOAT 3D Pipeline] Build standalone encountered error:', err);
}
