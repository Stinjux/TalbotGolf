# talbotGolf
Bilingual French/English golf consulting and design website. Node 22+, no runtime dependencies.

## Local
`npm start` then http://localhost:3000. `npm run check` checks JavaScript syntax.

## Railway
Connect this repository, branch main. Railway builds the Dockerfile and checks /health. The server listens on 0.0.0.0 and Railway's PORT. Enable automatic deployment on main. Generate a Railway domain for review before changing talbotgolf.ca DNS.

## Content
Edit content.mjs for both languages. Assets are in public/assets, optimized from owner-supplied originals. BRAND.txt is the supplied identity guide. Project names are conservatively derived from the supplied filenames: confirm full names, locations, exact role and dates before expanding case studies. Do not present concept renderings as completed construction.

Collaborator strip is implemented but hidden until verified logos are added to the collaborators array: {name,logo:'/assets/example.svg'}. Do not invent affiliations.

Contact currently opens the visitor's email application addressed to talbotgolf@gmail.com. It does not send email from the server or collect/store submissions. A server-sent form needs a configured email delivery provider.

Google Fonts provides Archivo with system-font fallback. No analytics or tracking cookies.
