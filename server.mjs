import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('public');
const policy="default-src 'self'; img-src 'self'; style-src 'self' https://fonts.googleapis.com 'sha256-e9xM2k+KD85g+btGR6B3dPFGiVYrfdF1hDZukzbJfC8='; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'sha256-a9cnwaq/AS/UA8urVSpT8IL4Xh1H1+CRZZuwET34zq0='; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
http.createServer(async(req,res)=>{
res.setHeader('Content-Security-Policy',policy);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/health'){res.writeHead(200);return res.end('ok');}if(url.pathname==='/'){res.writeHead(302,{Location:'/fr/'});return res.end();}
let path;if(/^\/(fr|en)\/?$/.test(url.pathname))path=resolve(root,'classic-'+url.pathname.slice(1,3)+'.html');else path=resolve(root,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(root+'/'))throw Error();const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.js':'text/javascript','.css':'text/css'})[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control',extname(path)==='.html'?'no-cache':'public, max-age=3600');res.end(data);
}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('404 — Page introuvable / Page not found');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0');
