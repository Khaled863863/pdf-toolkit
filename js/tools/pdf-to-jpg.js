(function(){
  const zone=document.getElementById('dropZone');
  const input=document.getElementById('fileInput');
  const list=document.getElementById('fileList');
  const options=document.getElementById('options');
  const quality=document.getElementById('quality');
  const scale=document.getElementById('scale');
  const runBtn=document.getElementById('runBtn');
  const status=document.getElementById('status');
  const progress=document.getElementById('progress');

  let file=null;

  setupDropZone(zone,input,inc=>{
    const pdf=inc.find(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
    if(!pdf){setStatus(status,'Please select a PDF file.','error');return;}
    file=pdf;
    list.innerHTML=`<div class="file-item"><span>🖼</span><span class="name">${pdf.name}</span><span class="size">${formatBytes(pdf.size)}</span></div>`;
    options.style.display='';runBtn.disabled=false;
    setStatus(status,'Ready. Choose quality and convert.','info');
  });

  runBtn.addEventListener('click',async()=>{
    if(!file)return;
    runBtn.disabled=true;setStatus(status,'Rendering pages…','info');setProgress(progress,5);
    try{
      const buf=await file.arrayBuffer();
      const doc=await pdfjsLib.getDocument({data:buf}).promise;
      const zip=new JSZip();
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d');
      const q=parseFloat(quality.value),s=parseFloat(scale.value);
      for(let i=1;i<=doc.numPages;i++){
        const page=await doc.getPage(i);
        const vp=page.getViewport({scale:s});
        canvas.width=vp.width;canvas.height=vp.height;
        ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const dataUrl=canvas.toDataURL('image/jpeg',q);
        zip.file(`page_${String(i).padStart(3,'0')}.jpg`,dataUrl.split(',')[1],{base64:true});
        setProgress(progress,5+(i/doc.numPages)*90);
      }
      const blob=await zip.generateAsync({type:'blob'});
      setProgress(progress,100);
      download(blob,file.name.replace(/\.pdf$/i,'')+'_images.zip');
      setStatus(status,'✓ Done! ZIP archive downloaded.','success');
    }catch(err){console.error(err);setStatus(status,'Error: '+err.message,'error');}
    finally{runBtn.disabled=false;}
  });
})();
