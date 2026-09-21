/* ==========================================================================
   TalbotGolf — serveur statique minimal (Node, sans dépendance)
   Sert index.html, styles.css, main.js et le dossier public/.
   Utilisé par le déploiement Railway ; en développement, un simple
   « python3 -m http.server » suffit.
   ========================================================================== */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Ancré sur l'emplacement du fichier, et non sur le répertoire courant :
// le serveur fonctionne quel que soit l'endroit d'où on le lance.
const racine = dirname(fileURLToPath(import.meta.url));

/* Politique de sécurité du contenu.
   - le sha256 correspond au court script en ligne de <head> qui pose la classe « js » ;
   - data: est nécessaire au grain de papier (bruit SVG en arrière-plan CSS) ;
   - Google Fonts fournit Newsreader et Archivo. */
const politique = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "script-src 'self' 'sha256-g9CG9SjnbZac20R7zoBeOJ3k2VF0kLwLJccW/K1JLcE='",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'"
].join('; ');

function duree(extension){
  if (extension === '.html') return 'no-cache';
  if (extension === '.css' || extension === '.js') return 'public, max-age=300';
  return 'public, max-age=86400';
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8'
};

http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', politique);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  try {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/health') { res.writeHead(200); return res.end('ok'); }

    // Le site était bilingue : les anciennes adresses /fr/ et /en/ mènent à l'accueil.
    if (/^\/(fr|en)\/?$/.test(url.pathname)) {
      res.writeHead(301, { Location: '/' });
      return res.end();
    }

    const chemin = url.pathname === '/'
      ? resolve(racine, 'index.html')
      : resolve(racine, '.' + decodeURIComponent(url.pathname));

    // On ne sert rien en dehors du dossier du site.
    if (chemin !== resolve(racine, 'index.html') && !chemin.startsWith(racine + '/')) throw new Error('hors racine');

    const extension = extname(chemin);
    const donnees = await readFile(chemin);

    res.setHeader('Content-Type', TYPES[extension] || 'application/octet-stream');
    /* Les noms de fichiers ne portent pas d'empreinte : un cache long figerait
       une feuille de style corrigée pendant des mois. La page est revalidée à
       chaque visite, le code quelques minutes, les images une journée. */
    res.setHeader('Cache-Control', duree(extension));
    res.end(donnees);

  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — Page introuvable');
  }
}).listen(Number(process.env.PORT) || 3000, '0.0.0.0');
