const data=JSON.parse(document.querySelector('#gallery-data').textContent);
const dialog=document.querySelector('dialog');
let opener;
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{opener=button;const i=Number(button.dataset.gallery);document.querySelector('#gallery-title').textContent=data.titles[i];const list=document.querySelector('.gallery-images');list.replaceChildren();data.galleries[i].forEach((file,n)=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src='/assets/'+file+'.webp';img.alt=data.titles[i]+' — '+(n+1);img.loading='lazy';caption.textContent=data.types[i]+' / '+(n+1);figure.append(img,caption);list.append(figure)});dialog.showModal();document.body.classList.add('modal-open')}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus()});
