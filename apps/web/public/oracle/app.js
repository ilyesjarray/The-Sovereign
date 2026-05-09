/* Oracle PWA — app.js */
(function(){
'use strict';

// === SERVICE WORKER ===
if('serviceWorker' in navigator) navigator.serviceWorker.register('/oracle/sw.js').catch(()=>{});

// === PWA INSTALL ===
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBanner').classList.add('show')});
document.getElementById('installBtn').addEventListener('click',()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('installBanner').classList.remove('show')})}});

// === TABS ===
const tabs=document.querySelectorAll('.tab');
const panels=document.querySelectorAll('.panel');
tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));t.classList.add('active');document.getElementById('panel-'+t.dataset.tab).classList.add('active')}));

// === ORACLE CHAT ===
const MODES=[
  {id:'executive',label:'EXEC',desc:'Business & Strategy'},
  {id:'academic',label:'ACAD',desc:'Research & Science'},
  {id:'philosophy',label:'SAPIENS',desc:'Philosophy & Wisdom'},
  {id:'casual',label:'PERSONAL',desc:'Life & Creativity'},
  {id:'code',label:'CODE',desc:'Programming'}
];
let currentMode='executive';
let chatHistory=[];
let isTyping=false;

// Render modes
const modeBar=document.getElementById('modeBar');
MODES.forEach(m=>{
  const b=document.createElement('div');
  b.className='mode-btn'+(m.id==='executive'?' active':'');
  b.textContent=m.label;
  b.addEventListener('click',()=>{currentMode=m.id;modeBar.querySelectorAll('.mode-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
  modeBar.appendChild(b);
});

const chatMsgs=document.getElementById('chatMsgs');
const chatInput=document.getElementById('chatInput');
const sendBtn=document.getElementById('sendBtn');

function scrollChat(){chatMsgs.scrollTop=chatMsgs.scrollHeight}

function renderMarkdown(text){
  let html=text;
  // Code blocks
  html=html.replace(/```(\w*)\n([\s\S]*?)```/g,(_,lang,code)=>'<pre><code>'+escHtml(code.trim())+'</code></pre>');
  // Inline code
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  // Bold
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  // Italic
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  // Headers
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  // Blockquote
  html=html.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>');
  // Tables
  html=html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g,(_,header,body)=>{
    const ths=header.split('|').filter(Boolean).map(h=>'<th>'+h.trim()+'</th>').join('');
    const rows=body.trim().split('\n').map(row=>{
      const tds=row.split('|').filter(Boolean).map(c=>'<td>'+c.trim()+'</td>').join('');
      return '<tr>'+tds+'</tr>';
    }).join('');
    return '<table><thead><tr>'+ths+'</tr></thead><tbody>'+rows+'</tbody></table>';
  });
  // Unordered lists
  html=html.replace(/^[•\-] (.+)$/gm,'<li>$1</li>');
  html=html.replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>');
  // Ordered lists
  html=html.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
  // Line breaks
  html=html.replace(/\n/g,'<br>');
  // Clean double br
  html=html.replace(/<br><br>/g,'<br>');
  return html;
}

function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function addMsg(role,content){
  const d=document.createElement('div');
  d.className='msg '+(role==='user'?'user':'bot');
  const av=document.createElement('div');
  av.className='avatar';
  av.textContent=role==='user'?'⌘':'◈';
  const bb=document.createElement('div');
  bb.className='bubble';
  bb.innerHTML=role==='user'?escHtml(content):renderMarkdown(content);
  d.appendChild(av);
  d.appendChild(bb);
  // Copy button for bot messages
  if(role==='assistant'){
    const cb=document.createElement('button');
    cb.className='copy-btn';
    cb.textContent='COPY';
    cb.addEventListener('click',()=>{navigator.clipboard.writeText(content);cb.textContent='COPIED';setTimeout(()=>cb.textContent='COPY',1500)});
    bb.appendChild(cb);
  }
  chatMsgs.appendChild(d);
  scrollChat();
}

function showTyping(){
  const d=document.createElement('div');
  d.className='msg bot';d.id='typingIndicator';
  d.innerHTML='<div class="avatar">◈</div><div class="typing"><span></span><span></span><span></span></div>';
  chatMsgs.appendChild(d);scrollChat();
}
function hideTyping(){const t=document.getElementById('typingIndicator');if(t)t.remove()}

async function sendMessage(text){
  const msg=(text||chatInput.value).trim();
  if(!msg||isTyping)return;
  chatInput.value='';autoResize();
  addMsg('user',msg);
  chatHistory.push({role:'user',content:msg});
  isTyping=true;sendBtn.classList.add('disabled');
  showTyping();

  try{
    const res=await fetch('/api/ai/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:msg,mode:currentMode,isSeriousMode:true,history:chatHistory.slice(-12)})
    });
    const data=await res.json();
    const reply=data.response||'ORACLE_ERROR: No response.';
    hideTyping();
    addMsg('assistant',reply);
    chatHistory.push({role:'assistant',content:reply});
  }catch(e){
    hideTyping();
    addMsg('assistant','ORACLE_ERROR: Connection disrupted.');
  }
  isTyping=false;sendBtn.classList.remove('disabled');
}

sendBtn.addEventListener('click',()=>sendMessage());
chatInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}});

function autoResize(){chatInput.style.height='auto';chatInput.style.height=Math.min(chatInput.scrollHeight,120)+'px'}
chatInput.addEventListener('input',autoResize);

// Initial message
addMsg('assistant','**SOVEREIGN ORACLE — ONLINE**\n\nLlama-3.3-70B neural link active. No content restrictions. Select mode and issue commands.\n\n• **EXEC** — Business, Finance, Strategy\n• **ACAD** — Science, Research, Math\n• **SAPIENS** — Philosophy, Psychology\n• **PERSONAL** — Life, Creativity, Help\n• **CODE** — Programming, Architecture');

// === DIGITAL SCOUT ===
const scoutList=document.getElementById('scoutList');
const scanBtn=document.getElementById('scanBtn');
let scoutReports=[];

async function loadScoutData(){
  scoutList.innerHTML='<div class="empty">Scanning...</div>';
  try{
    const res=await fetch('/api/intel/news');
    if(res.ok){
      const data=await res.json();
      scoutReports=data.reports||[];
      renderScouts();
    }
  }catch(e){scoutList.innerHTML='<div class="empty">Signal lost. Retry scan.</div>'}
}

function renderScouts(){
  if(!scoutReports.length){scoutList.innerHTML='<div class="empty">No intel intercepted</div>';return}
  scoutList.innerHTML='';
  scoutReports.forEach(r=>{
    const c=document.createElement('div');
    c.className='scout-card';
    const lvl=(r.intel_level||'INFO').toLowerCase();
    c.innerHTML=`<div class="bar ${lvl}"></div><div class="type">${r.scout_type||'NEWS'}</div><div class="content">${escHtml(r.content||'')}</div><div class="meta"><span>${lvl.toUpperCase()}</span><span>${r.created_at?new Date(r.created_at).toLocaleTimeString():''}</span></div>`;
    scoutList.appendChild(c);
  });
}

scanBtn.addEventListener('click',async()=>{
  scanBtn.textContent='⚡ Scanning...';
  try{
    const res=await fetch('/api/intel/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({})});
    if(res.ok)await loadScoutData();
  }catch(e){}
  scanBtn.textContent='⚡ Initiate Global Scan';
});

// Load scouts when tab clicked
document.querySelector('[data-tab="scout"]').addEventListener('click',()=>{if(!scoutReports.length)loadScoutData()});

// === VISION FORGE (Image Generation) ===
const forgePrompt=document.getElementById('forgePrompt');
const forgeModel=document.getElementById('forgeModel');
const forgeBtn=document.getElementById('forgeBtn');
const gallery=document.getElementById('gallery');
const fsOverlay=document.getElementById('fsOverlay');
const fsImg=document.getElementById('fsImg');

fsOverlay.addEventListener('click',()=>fsOverlay.style.display='none');

forgeBtn.addEventListener('click',async()=>{
  const p=forgePrompt.value.trim();if(!p)return;
  forgeBtn.disabled=true;forgeBtn.textContent='Rendering...';
  try{
    const seed=Math.floor(Math.random()*1e9);
    const model=forgeModel.value;
    const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=1024&seed=${seed}&nologo=true&model=${model}`;
    const res=await fetch(url,{headers:{'Accept':'image/jpeg'}});
    if(!res.ok)throw new Error('Generation failed');
    const blob=await res.blob();
    const imgUrl=URL.createObjectURL(blob);
    const img=document.createElement('img');
    img.src=imgUrl;img.alt=p;
    img.addEventListener('click',()=>{fsImg.src=imgUrl;fsOverlay.style.display='flex'});
    gallery.prepend(img);
  }catch(e){alert('Generation failed. Try again.')}
  forgeBtn.disabled=false;forgeBtn.textContent='Generate';
});

// === VISION SCOUT (Image Analysis) ===
const visionFile=document.getElementById('visionFile');
const visionPreview=document.getElementById('visionPreview');
const visionPrompt=document.getElementById('visionPrompt');
const visionBtn=document.getElementById('visionBtn');
const visionResult=document.getElementById('visionResult');
let visionBase64=null;

visionFile.addEventListener('change',e=>{
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    visionBase64=ev.target.result;
    visionPreview.src=visionBase64;
    visionPreview.style.display='block';
  };
  reader.readAsDataURL(file);
});

visionBtn.addEventListener('click',async()=>{
  if(!visionBase64){alert('Upload an image first.');return}
  const prompt=visionPrompt.value.trim()||'Analyze this image in detail.';
  visionBtn.disabled=true;visionBtn.textContent='Analyzing...';
  visionResult.innerHTML='<div class="empty">Processing vision data...</div>';
  try{
    const res=await fetch('/api/ai/vision',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:prompt,images:[visionBase64]})
    });
    const data=await res.json();
    const d=document.createElement('div');
    d.className='msg bot';
    d.innerHTML='<div class="avatar">◈</div><div class="bubble">'+renderMarkdown(data.response||'No analysis returned.')+'</div>';
    visionResult.innerHTML='';
    visionResult.appendChild(d);
  }catch(e){visionResult.innerHTML='<div class="empty">Vision analysis failed.</div>'}
  visionBtn.disabled=false;visionBtn.textContent='Analyze';
});

})();
