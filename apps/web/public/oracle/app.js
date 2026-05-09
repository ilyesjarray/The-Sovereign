/* Oracle PWA — Unified App Logic */
(function(){
'use strict';

// === SERVICE WORKER ===
if('serviceWorker' in navigator) navigator.serviceWorker.register('/oracle/sw.js').catch(()=>{});

// === PWA INSTALL ===
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBanner').classList.add('show')});
document.getElementById('installBtn').addEventListener('click',()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('installBanner').classList.remove('show')})}});

// === DOM ELEMENTS ===
const chatMsgs=document.getElementById('chatMsgs');
const chatInput=document.getElementById('chatInput');
const sendBtn=document.getElementById('sendBtn');
const attachBtn=document.getElementById('attachBtn');
const fileInput=document.getElementById('fileInput');
const attachmentPreview=document.getElementById('attachmentPreview');
const previewImg=document.getElementById('previewImg');
const removeAttachment=document.getElementById('removeAttachment');
const fsOverlay=document.getElementById('fsOverlay');
const fsImg=document.getElementById('fsImg');

let chatHistory=[];
let isTyping=false;
let imageBase64=null;

// === UTILS ===
function scrollChat(){chatMsgs.scrollTop=chatMsgs.scrollHeight}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderMarkdown(text){
  let html=text;
  html=html.replace(/```(\w*)\n([\s\S]*?)```/g,(_,lang,code)=>'<pre><code>'+escHtml(code.trim())+'</code></pre>');
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  html=html.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>');
  html=html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g,(_,header,body)=>{
    const ths=header.split('|').filter(Boolean).map(h=>'<th>'+h.trim()+'</th>').join('');
    const rows=body.trim().split('\n').map(row=>{
      const tds=row.split('|').filter(Boolean).map(c=>'<td>'+c.trim()+'</td>').join('');
      return '<tr>'+tds+'</tr>';
    }).join('');
    return '<table><thead><tr>'+ths+'</tr></thead><tbody>'+rows+'</tbody></table>';
  });
  html=html.replace(/^[•\-] (.+)$/gm,'<li>$1</li>');
  html=html.replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>');
  html=html.replace(/^\d+\. (.+)$/gm,'<li>$1</li>');
  html=html.replace(/\n/g,'<br>');
  html=html.replace(/<br><br>/g,'<br>');
  return html;
}

// === FULLSCREEN IMAGE ===
function openFullscreen(src){fsImg.src=src;fsOverlay.classList.add('show')}
fsOverlay.addEventListener('click',()=>fsOverlay.classList.remove('show'));

// === RENDER MESSAGES ===
function addMsg(role,content,imgSrc=null){
  const d=document.createElement('div');
  d.className='msg '+(role==='user'?'user':'bot');
  const av=document.createElement('div');
  av.className='avatar';
  av.textContent=role==='user'?'⌘':'◈';
  const bb=document.createElement('div');
  bb.className='bubble';
  
  if(imgSrc){
    const i=document.createElement('img');
    i.src=imgSrc;
    i.addEventListener('click',()=>openFullscreen(imgSrc));
    bb.appendChild(i);
  }
  
  if(content){
    const txt=document.createElement('div');
    txt.innerHTML=role==='user'?escHtml(content):renderMarkdown(content);
    bb.appendChild(txt);
  }

  d.appendChild(av);
  d.appendChild(bb);
  
  // Add image click listeners for dynamically rendered markdown images
  if(role==='assistant'){
    setTimeout(()=>{
      bb.querySelectorAll('img').forEach(img=>{
        img.addEventListener('click',()=>openFullscreen(img.src));
      });
    },100);
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

// === ATTACHMENT LOGIC ===
attachBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>{
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    imageBase64=ev.target.result;
    previewImg.src=imageBase64;
    attachmentPreview.classList.add('show');
    chatInput.focus();
    updateSendBtnState();
  };
  reader.readAsDataURL(file);
});
removeAttachment.addEventListener('click',()=>{
  imageBase64=null;
  previewImg.src='';
  attachmentPreview.classList.remove('show');
  fileInput.value='';
  updateSendBtnState();
});

// === AUTO RESIZE INPUT ===
function autoResize(){
  chatInput.style.height='auto';
  chatInput.style.height=Math.min(chatInput.scrollHeight,120)+'px';
  updateSendBtnState();
}
chatInput.addEventListener('input',autoResize);

function updateSendBtnState(){
  if(chatInput.value.trim() || imageBase64){
    sendBtn.classList.add('active');
  } else {
    sendBtn.classList.remove('active');
  }
}

// === SENDING LOGIC ===
async function sendMessage(){
  const text=chatInput.value.trim();
  if((!text && !imageBase64) || isTyping) return;
  
  const currentImg=imageBase64;
  const currentText=text;

  // Clear UI immediately
  chatInput.value='';
  chatInput.style.height='auto';
  imageBase64=null;
  attachmentPreview.classList.remove('show');
  updateSendBtnState();

  // Add User Message
  addMsg('user', currentText, currentImg);
  isTyping=true;
  showTyping();

  // Route 1: Image Generation (/imagine)
  if(currentText.toLowerCase().startsWith('/imagine ')){
    const prompt=currentText.substring(9).trim();
    try {
      const seed=Math.floor(Math.random()*1e9);
      const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
      const res=await fetch(url,{headers:{'Accept':'image/jpeg'}});
      if(!res.ok) throw new Error();
      const blob=await res.blob();
      const imgUrl=URL.createObjectURL(blob);
      hideTyping();
      addMsg('assistant','**Synthesis Complete.**', imgUrl);
    } catch(e) {
      hideTyping();
      addMsg('assistant','**ORACLE_ERROR:** Synthesis failed. Target network unstable.');
    }
    isTyping=false;
    return;
  }

  // Route 2: Image Analysis (Vision)
  if(currentImg){
    try {
      const prompt = currentText || 'Analyze this image in detail and extract all text/context.';
      const res=await fetch('/api/ai/vision',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:prompt,images:[currentImg]})
      });
      const data=await res.json();
      hideTyping();
      addMsg('assistant',data.response||'**ORACLE_ERROR:** Vision parsing failed.');
    } catch(e) {
      hideTyping();
      addMsg('assistant','**ORACLE_ERROR:** Vision node unreachable.');
    }
    isTyping=false;
    return;
  }

  // Route 3: Standard Chat (Omni)
  try{
    chatHistory.push({role:'user',content:currentText});
    const res=await fetch('/api/ai/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      // Using 'omni' mode created in route.ts
      body:JSON.stringify({message:currentText,mode:'omni',isSeriousMode:true,history:chatHistory.slice(-12)})
    });
    const data=await res.json();
    const reply=data.response||'**ORACLE_ERROR:** No response.';
    hideTyping();
    addMsg('assistant',reply);
    chatHistory.push({role:'assistant',content:reply});
  }catch(e){
    hideTyping();
    addMsg('assistant','**ORACLE_ERROR:** Connection disrupted.');
  }
  isTyping=false;
}

sendBtn.addEventListener('click',()=>sendMessage());
chatInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();
    sendMessage();
  }
});

// Initial greeting
setTimeout(()=>{
  addMsg('assistant','**SOVEREIGN ORACLE — ONLINE**\n\nI am the absolute apex AI entity. I am capable of general reasoning, translation, code architecture, and high-density logic.\n\n• Attach an image to initialize Vision Analysis.\n• Type `/imagine <prompt>` to synthesize an image.\n• Issue text commands for instantaneous response.');
}, 500);

})();
