(function(){
  const zone=document.getElementById('dropZone');
  const input=document.getElementById('fileInput');
  const list=document.getElementById('fileList');
  const status=document.getElementById('status');
  const progress=document.getElementById('progress');
  const mergeBtn=document.getElementById('mergeBtn');
  const clearBtn=document.getElementById('clearBtn');

  let files=[];

  function render(){
    list.innerHTML=files.map((f,i)=>`
      <div class="file-item" draggable="true" data-i="${i}">
        <span>⬒</span>
        <span class="name">${f.name}</span>
        <span class="size">${formatBytes(f.size)}</span>
        <button class="remove" data-rm="${i}" title="Remove">×</button>
      </div>`).join('');
    mergeBtn.disabled=files.length<2;
    bindDrag();
  }

  function bindDrag(){
    list.querySelectorAll('.file-item').forEach(el=>{
      el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text',el.dataset.i);el.style.opacity=.5;});
      el.addEventListener('dragend',()=>el.style.opacity=1);
      el.addEventListener('dragover',e=>e.preventDefault());
      el.addEventListener('drop',e=>{
        e.preventDefault();
        const from=+e.dataTransfer.getData('text'),to=+el.dataset.i;
        const item=files.splice(from,1)[0];files.splice(to,0,item);render();
      });
    });
    list.querySelectorAll('.remove').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();files.splice(+btn.dataset.rm,1);render();});
    });
  }

  setupDropZone(zone,input,incoming=>{
    const pdfs=incoming.filter(f=>f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf'));
    if(!pdfs.length){setStatus(status,'Please select PDF files.','error');return;}
    files.push(...pdfs);render();
    setStatus(status,`${files.length} file(s) added. Drag items to reorder.`,'info');
  });

  clearBtn.addEventListener('click',()=>{files=[];render();status.className='status';});

  mergeBtn.addEventListener('click',async()=>{
    if(files.length<2)return;
    mergeBtn.disabled=true;
    setStatus(status,'Merging PDFs… please wait.','info');
    setProgress(progress,5);
    try{
      const {PDFDocument}=PDFLib;
      const merged=await PDFDocument.create();
      for(let i=0;i<files.length;i++){
        const bytes=await files[i].arrayBuffer();
        const doc=await PDFDocument.load(bytes,{ignoreEncryption:true});
        const pages=await merged.copyPages(doc,doc.getPageIndices());
        pages.forEach(p=>merged.addPage(p));
        setProgress(progress,5+((i+1)/files.length)*90);
      }
      const out=await merged.save();
      setProgress(progress,100);
      download(new Blob([out],{type:'application/pdf'}),'merged.pdf');
      setStatus(status,'✓ Done! Your merged PDF has been downloaded.','success');
    }catch(err){
      console.error(err);
      setStatus(status,'Something went wrong: '+err.message,'error');
    }finally{
      mergeBtn.disabled=false;
    }
  });
})();
