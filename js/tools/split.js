(function(){
  const zone=document.getElementById('dropZone');
  const input=document.getElementById('fileInput');
  const list=document.getElementById('fileList');
  const options=document.getElementById('options');
  const mode=document.getElementById('mode');
  const rangeRow=document.getElementById('rangeRow');
  const range=document.getElementById('range');
  const runBtn=document.getElementById('runBtn');
  const status=document.getElementById('status');
  const progress=document.getElementById('progress');

  let file=null;

  mode.addEventListener('change',()=>{rangeRow.style.display=mode.value==='range'?'':'none';});

  function parseRanges(txt,total){
    const pages=new Set();
    txt.split(',').map(s=>s.trim()).filter(Boolean).forEach(part=>{
      const m=part.match(/^(\d+)\s*-\s*(\d+)$/);
      if(m){for(let i=+m[1];i<=+m[2];i++)if(i>=1&&i<=total)pages.add(i-1);}
      else if(/^\d+$/.test(part)){const n=+part;if(n>=1&&n<=total)pages.add(n-1);}
    });
    return [...pages].sort((a,b)=>a-b);
  }

  setupDropZone(zone,input,incoming=>{
    const pdf=incoming.find(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
    if(!pdf){setStatus(status,'Please select a PDF file.','error');return;}
    file=pdf;
    list.innerHTML=`<div class="file-item"><span>✂</span><span class="name">${pdf.name}</span><span class="size">${formatBytes(pdf.size)}</span></div>`;
    options.style.display='';runBtn.disabled=false;
    setStatus(status,'File loaded. Choose how to split.','info');
  });

  runBtn.addEventListener('click',async()=>{
    if(!file)return;
    runBtn.disabled=true;setStatus(status,'Processing…','info');setProgress(progress,10);
    try{
      const {PDFDocument}=PDFLib;
      const bytes=await file.arrayBuffer();
      const src=await PDFDocument.load(bytes,{ignoreEncryption:true});
      const total=src.getPageCount();
      if(mode.value==='range'){
        const idxs=parseRanges(range.value,total);
        if(!idxs.length){setStatus(status,'Enter a valid page range.','error');runBtn.disabled=false;return;}
        const out=await PDFDocument.create();
        const pages=await out.copyPages(src,idxs);
        pages.forEach(p=>out.addPage(p));
        setProgress(progress,80);
        const data=await out.save();
        download(new Blob([data],{type:'application/pdf'}),file.name.replace(/\.pdf$/i,'')+'_extracted.pdf');
      }else{
        const zip=new JSZip();
        for(let i=0;i<total;i++){
          const out=await PDFDocument.create();
          const [p]=await out.copyPages(src,[i]);
          out.addPage(p);
          const data=await out.save();
          zip.file(`page_${String(i+1).padStart(3,'0')}.pdf`,data);
          setProgress(progress,10+((i+1)/total)*80);
        }
        const blob=await zip.generateAsync({type:'blob'});
        download(blob,file.name.replace(/\.pdf$/i,'')+'_pages.zip');
      }
      setProgress(progress,100);
      setStatus(status,'✓ Done! Your file has been downloaded.','success');
    }catch(err){console.error(err);setStatus(status,'Error: '+err.message,'error');}
    finally{runBtn.disabled=false;}
  });
})();
