(function(){
  const zone=document.getElementById('dropZone');
  const input=document.getElementById('fileInput');
  const list=document.getElementById('fileList');
  const options=document.getElementById('options');
  const pageSize=document.getElementById('pageSize');
  const orient=document.getElementById('orient');
  const runBtn=document.getElementById('runBtn');
  const clearBtn=document.getElementById('clearBtn');
  const status=document.getElementById('status');
  const progress=document.getElementById('progress');

  let files=[];
  const SIZES={a4:[595.28,841.89],letter:[612,792]};

  function render(){
    list.innerHTML=files.map((f,i)=>`
      <div class="file-item" draggable="true" data-i="${i}">
        <span>📷</span>
        <span class="name">${f.name}</span>
        <span class="size">${formatBytes(f.size)}</span>
        <button class="remove" data-rm="${i}">×</button>
      </div>`).join('');
    runBtn.disabled=files.length===0;
    options.style.display=files.length?'':'none';
    list.querySelectorAll('.file-item').forEach(el=>{
      el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text',el.dataset.i);el.style.opacity=.5;});
      el.addEventListener('dragend',()=>el.style.opacity=1);
      el.addEventListener('dragover',e=>e.preventDefault());
      el.addEventListener('drop',e=>{e.preventDefault();const f=+e.dataTransfer.getData('text'),t=+el.dataset.i;const it=files.splice(f,1)[0];files.splice(t,0,it);render();});
    });
    list.querySelectorAll('.remove').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();files.splice(+b.dataset.rm,1);render();}));
  }

  setupDropZone(zone,input,inc=>{
    const imgs=inc.filter(f=>/^image\/(jpeg|png)$/.test(f.type)||/\.(jpe?g|png)$/i.test(f.name));
    if(!imgs.length){setStatus(status,'Please select JPG or PNG images.','error');return;}
    files.push(...imgs);render();
    setStatus(status,`${files.length} image(s) added.`,'info');
  });

  clearBtn.addEventListener('click',()=>{files=[];render();status.className='status';});

  runBtn.addEventListener('click',async()=>{
    if(!files.length)return;
    runBtn.disabled=true;setStatus(status,'Building PDF…','info');setProgress(progress,5);
    try{
      const {PDFDocument}=PDFLib;
      const out=await PDFDocument.create();
      for(let i=0;i<files.length;i++){
        const f=files[i];
        const bytes=await f.arrayBuffer();
        const img=/png/i.test(f.type)||/\.png$/i.test(f.name)
          ? await out.embedPng(bytes)
          : await out.embedJpg(bytes);
        let w=img.width,h=img.height;
        if(pageSize.value!=='fit'){
          let [pw,ph]=SIZES[pageSize.value];
          if(orient.value==='landscape'||(orient.value==='auto'&&img.width>img.height))[pw,ph]=[ph,pw];
          const sc=Math.min(pw/img.width,ph/img.height);
          const iw=img.width*sc,ih=img.height*sc;
          const pg=out.addPage([pw,ph]);
          pg.drawImage(img,{x:(pw-iw)/2,y:(ph-ih)/2,width:iw,height:ih});
        }else{
          const pg=out.addPage([w,h]);
          pg.drawImage(img,{x:0,y:0,width:w,height:h});
        }
        setProgress(progress,5+((i+1)/files.length)*90);
      }
      const data=await out.save();
      setProgress(progress,100);
      download(new Blob([data],{type:'application/pdf'}),'images.pdf');
      setStatus(status,'✓ PDF created!','success');
    }catch(err){console.error(err);setStatus(status,'Error: '+err.message,'error');}
    finally{runBtn.disabled=false;}
  });
})();
