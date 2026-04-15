// Shared header/footer injection + utilities
// Detect depth so the same code works from the root AND from /tools/ pages
const B = (function(){
  const p = window.location.pathname.replace(/\\/g,'/');
  return /\/tools\//i.test(p) ? '../' : '';
})();

const TOOLS = [
  {slug:'merge-pdf',       name:'Merge PDF',       icon:'⬒', cls:'ic-red',    desc:'Combine multiple PDFs into one file.'},
  {slug:'split-pdf',       name:'Split PDF',       icon:'✂', cls:'ic-blue',   desc:'Extract pages or split a PDF into parts.'},
  {slug:'compress-pdf',    name:'Compress PDF',    icon:'⇩', cls:'ic-green',  desc:'Reduce file size while keeping quality.'},
  {slug:'pdf-to-jpg',      name:'PDF to JPG',      icon:'🖼', cls:'ic-purple', desc:'Convert every PDF page into a JPG image.'},
  {slug:'jpg-to-pdf',      name:'JPG to PDF',      icon:'📷', cls:'ic-orange', desc:'Convert images into a single PDF file.'},
  {slug:'rotate-pdf',      name:'Rotate PDF',      icon:'↻', cls:'ic-teal',   desc:'Rotate all pages in your PDF at once.'},
  {slug:'organize-pdf',    name:'Organize PDF',    icon:'☰', cls:'ic-pink',   desc:'Reorder or delete pages in your PDF.'},
  {slug:'pdf-to-word',     name:'PDF to Word',     icon:'W', cls:'ic-blue',   desc:'Convert PDF to an editable Word document.'},
  {slug:'word-to-pdf',     name:'Word to PDF',     icon:'D', cls:'ic-red',    desc:'Convert DOCX files into PDF format.'},
  {slug:'pdf-to-text',     name:'PDF to Text',     icon:'T', cls:'ic-slate',  desc:'Extract plain text from any PDF.'},
  {slug:'html-to-pdf',     name:'HTML to PDF',     icon:'<>', cls:'ic-indigo',desc:'Convert an HTML page or code to PDF.'},
  {slug:'add-watermark',   name:'Add Watermark',   icon:'©', cls:'ic-yellow', desc:'Stamp text over every page of your PDF.'},
  {slug:'add-page-numbers',name:'Page Numbers',    icon:'#', cls:'ic-green',  desc:'Insert page numbers into your PDF.'},
  {slug:'protect-pdf',     name:'Protect PDF',     icon:'🔒', cls:'ic-slate',  desc:'Add a password to your PDF (flag).'},
  {slug:'unlock-pdf',      name:'Unlock PDF',      icon:'🔓', cls:'ic-purple', desc:'Remove password protection (if known).'},
];

function renderHeader(){
  const html = `
    <header class="site-header">
      <div class="nav">
        <a class="logo" href="${B}index.html">PDF<span>Toolkit</span></a>
        <button class="menu-toggle" aria-label="Menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
        <ul class="nav-links">
          <li><a href="${B}index.html">Home</a></li>
          <li><a href="${B}index.html#tools">All Tools</a></li>
          <li><a href="${B}about.html">About</a></li>
          <li><a href="${B}contact.html">Contact</a></li>
        </ul>
      </div>
    </header>`;
  document.body.insertAdjacentHTML('afterbegin', html);
}

function renderFooter(){
  const year = new Date().getFullYear();
  const html = `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-col">
          <h4>PDF Toolkit</h4>
          <p style="font-size:14px;color:#94a3b8">Free online PDF tools that work entirely in your browser. Your files never leave your device.</p>
        </div>
        <div class="footer-col">
          <h4>Popular Tools</h4>
          <ul>
            <li><a href="${B}tools/merge-pdf.html">Merge PDF</a></li>
            <li><a href="${B}tools/split-pdf.html">Split PDF</a></li>
            <li><a href="${B}tools/compress-pdf.html">Compress PDF</a></li>
            <li><a href="${B}tools/pdf-to-word.html">PDF to Word</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="${B}about.html">About</a></li>
            <li><a href="${B}contact.html">Contact</a></li>
            <li><a href="${B}privacy.html">Privacy Policy</a></li>
            <li><a href="${B}terms.html">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">© ${year} PDF Toolkit. All rights reserved.</div>
    </footer>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function renderAdSlot(label='Advertisement'){
  return `
    <div class="ad-slot" data-ad-slot>
      <!-- Google AdSense: paste your <ins class="adsbygoogle"> here once approved -->
      <span>${label}</span>
    </div>`;
}

// File helpers
function formatBytes(b){
  if(b===0)return'0 B';const k=1024;const s=['B','KB','MB','GB'];
  const i=Math.floor(Math.log(b)/Math.log(k));
  return (b/Math.pow(k,i)).toFixed(i?1:0)+' '+s[i];
}
function download(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},100);
}
function setStatus(el,msg,type='info'){
  el.className='status '+type;el.textContent=msg;
}
function setProgress(el,pct){
  const bar=el.querySelector('.progress-bar');
  el.classList.add('active');bar.style.width=pct+'%';
  if(pct>=100)setTimeout(()=>el.classList.remove('active'),400);
}

function setupDropZone(zone,input,onFiles,accept='.pdf'){
  zone.addEventListener('click',()=>input.click());
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',e=>{
    e.preventDefault();zone.classList.remove('drag-over');
    onFiles([...e.dataTransfer.files]);
  });
  input.addEventListener('change',e=>onFiles([...e.target.files]));
}

document.addEventListener('DOMContentLoaded',()=>{
  renderHeader();
  renderFooter();
  document.querySelectorAll('[data-ad]').forEach(el=>{
    el.outerHTML=renderAdSlot();
  });
  const grid=document.getElementById('toolsGrid');
  if(grid){
    grid.innerHTML=TOOLS.map(t=>`
      <a class="tool-card" href="${B}tools/${t.slug}.html">
        <div class="tool-icon ${t.cls}">${t.icon}</div>
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
      </a>`).join('');
  }
});
