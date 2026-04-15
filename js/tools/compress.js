(function(){
  const zone=document.getElementById('dropZone');
  const input=document.getElementById('fileInput');
  const list=document.getElementById('fileList');
  const options=document.getElementById('options');
  const level=document.getElementById('level');
  const runBtn=document.getElementById('runBtn');
  const status=document.getElementById('status');
  const progress=document.getElementById('progress');

  let file=null;

  setupDropZone(zone,input,inc=>{
    const pdf=inc.find(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
    if(!pdf){setStatus(status,'Please select a PDF file.','error');return;}
    file=pdf;
    list.innerHTML=`<div class="file-item"><span>⇩</span><span class="name">${pdf.name}</span><span class="size">${formatBytes(pdf.size)}</span></div>`;
    options.style.display='';runBtn.disabled=false;
    setStatus(status,'File loaded. Pick a compression level.','info');
  });

  const PRESETS={high:{scale:1.1,q:.55},medium:{scale:1.4,q:.75},low:{scale:1.8,q:.9}};

  runBtn.addEventListener('click',async()=>{
    if(!file)return;
    runBtn.disabled=true;setStatus(status,'Compressing… this may take a moment.','info');setProgress(progress,5);
    try{
      const preset=PRESETS[level.value];
      const buf=await file.arrayBuffer();
      const src=await pdfjsLib.getDocument({data:buf.slice(0)}).promise;
      const {PDFDocument}=PDFLib;
      const out=await PDFDocument.create();
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      for(let i=1;i<=src.numPages;i++){
        const page=await src.getPage(i);
        const vp=page.getViewport({scale:preset.scale});
        canvas.width=vp.width;canvas.height=vp.height;
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const dataUrl=canvas.toDataURL('image/jpeg',preset.q);
        const b=await fetch(dataUrl).then(r=>r.arrayBuffer());
        const img=await out.embedJpg(b);
        const p=out.addPage([vp.width,vp.height]);
        p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
        setProgress(progress,5+(i/src.numPages)*90);
      }
      const data=await out.save();
      const origKB=file.size,newKB=data.length;
      const pct=Math.round((1-newKB/origKB)*100);
      setProgress(progress,100);
      download(new Blob([data],{type:'application/pdf'}),file.name.replace(/\.pdf$/i,'')+'_compressed.pdf');
      if(pct>0)setStatus(status,`✓ Done! Saved ${pct}% — ${formatBytes(origKB)} → ${formatBytes(newKB)}.`,'success');
      else setStatus(status,`✓ Done, but file was already well-optimized (${formatBytes(origKB)} → ${formatBytes(newKB)}).`,'info');
    }catch(err){console.error(err);setStatus(status,'Error: '+err.message,'error');}
    finally{runBtn.disabled=false;}
  });
})();
