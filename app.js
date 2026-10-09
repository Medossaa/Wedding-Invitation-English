'use strict';
document.body.classList.add('cover-closed');
const cover=document.getElementById('cover');
let invitationOpened=false;
cover.addEventListener('click',()=>{
  if(invitationOpened)return;invitationOpened=true;startMusic();cover.classList.add('opened');
  cover.hidden=true;document.body.classList.remove('cover-closed');window.scrollTo({top:0,behavior:'instant'});document.querySelector('h1').focus({preventScroll:true});startAutoScroll();
});
const eventTime=Date.parse('2026-12-04T16:00:00+02:00');
function tick(){const s=Math.max(0,Math.floor((eventTime-Date.now())/1000));const units=[Math.floor(s/86400),Math.floor(s/3600)%24,Math.floor(s/60)%60,s%60];['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=new Intl.NumberFormat(document.documentElement.lang==='en'?'en':'ar',{minimumIntegerDigits:2,useGrouping:false}).format(units[i]));document.getElementById('celebration').hidden=s>0;}tick();setInterval(tick,1000);
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
// Begin local audio directly inside the opening gesture for mobile browsers.
const music=document.getElementById('background-music');
const musicToggle=document.getElementById('music-toggle');
let wantsMusic=true;
music.volume=.35;
function syncMusicButton(){const playing=!music.paused;musicToggle.textContent=playing?'♫':'▶';musicToggle.setAttribute('aria-label',playing?'Pause music':'Play music');musicToggle.setAttribute('aria-pressed',String(playing));}
function startMusic(){musicToggle.hidden=false;wantsMusic=true;music.play().then(syncMusicButton).catch(syncMusicButton);}
musicToggle.addEventListener('click',()=>{if(music.paused){startMusic();}else{wantsMusic=false;music.pause();syncMusicButton();}});
music.addEventListener('playing',syncMusicButton);music.addEventListener('pause',syncMusicButton);
document.addEventListener('visibilitychange',()=>{if(document.hidden){music.pause();}else if(wantsMusic&&cover.hidden){music.play().catch(syncMusicButton);}});

// Continuous automatic scrolling; actual contact is the only interaction pause.
let autoScrollFrame=null,autoScrollStarted=false;
const heldPointers=new Set();let heldTouches=0;
let scrollPosition=0,lastWrittenScroll=0;
function startAutoScroll(){
  if(autoScrollStarted||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  autoScrollStarted=true;
  const root=document.scrollingElement||document.documentElement;
  const scrollSpeed=150;
  let maxScroll=0;
  function refreshScrollLimit(){maxScroll=Math.max(0,root.scrollHeight-root.clientHeight);}
  refreshScrollLimit();
  window.addEventListener('resize',refreshScrollLimit,{passive:true});
  if('ResizeObserver' in window){const layoutObserver=new ResizeObserver(refreshScrollLimit);layoutObserver.observe(document.body);}
  if(document.fonts)document.fonts.ready.then(refreshScrollLimit);
  let last=performance.now();scrollPosition=root.scrollTop;lastWrittenScroll=root.scrollTop;
  function advance(now){
    const elapsed=Math.min(now-last,80);last=now;
    const current=root.scrollTop;
    if(heldPointers.size||heldTouches||document.hidden){
      scrollPosition=current;lastWrittenScroll=current;
    }else{
      // Adopt a manual scroll, including native swipe momentum, from its new position.
      if(Math.abs(current-lastWrittenScroll)>1)scrollPosition=current;
      scrollPosition=Math.min(maxScroll,Math.max(0,scrollPosition+elapsed*scrollSpeed/1000));
      if(Math.abs(scrollPosition-current)>=.5){root.scrollTop=scrollPosition;lastWrittenScroll=root.scrollTop;}
    }
    autoScrollFrame=requestAnimationFrame(advance);
  }
  autoScrollFrame=requestAnimationFrame(advance);
}
document.addEventListener('touchstart',event=>{heldTouches=event.touches.length;},{passive:true});
['touchend','touchcancel'].forEach(type=>window.addEventListener(type,event=>{heldTouches=event.touches.length;},{passive:true}));
if('PointerEvent' in window){
 document.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')heldPointers.add(event.pointerId);},{passive:true});
 ['pointerup','pointercancel'].forEach(type=>window.addEventListener(type,event=>{heldPointers.delete(event.pointerId);},{passive:true}));
}else{
 document.addEventListener('mousedown',()=>heldPointers.add('mouse'),{passive:true});
 window.addEventListener('mouseup',()=>heldPointers.delete('mouse'),{passive:true});
}
window.addEventListener('blur',()=>{heldPointers.clear();heldTouches=0;});
document.addEventListener('visibilitychange',()=>{heldPointers.clear();heldTouches=0;});

// Return to the start immediately, overriding CSS smooth scrolling.
document.getElementById('back-to-top').addEventListener('click',event=>{
  event.preventDefault();
  window.scrollTo({top:0,left:0,behavior:'instant'});
  document.querySelector('h1').focus({preventScroll:true});
});

// Airy pearl-and-lavender fireworks, rendered only during short celebrations.
(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=document.createElement('canvas');canvas.id='celebration-fireworks';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);canvas.hidden=true;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  let width=0,height=0,particles=[],frame=0,last=0,timers=[];
  const palette=['#a476cc','#8060b2','#8bb7df','#c6a563','#bda6d8'];
  function resize(){width=window.innerWidth;height=window.innerHeight;const ratio=Math.min(window.devicePixelRatio||1,1.5);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);}
  resize();let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(width!==window.innerWidth||Math.abs(height-window.innerHeight)>100)resize();},180);},{passive:true});
  function burst(x,y,index){
    if(document.hidden||reduced.matches)return;
    const color=palette[index%palette.length],count=40;
    for(let i=0;i<count;i++){
      const angle=i/count*Math.PI*2,ring=i%2?1:.62,speed=(55+Math.random()*45)*ring;
      particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,age:0,life:1.6+Math.random()*.6,color,size:i%6===0?2.8:1.5,trail:[]});
    }
    canvas.hidden=false;if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}
  }
  function draw(now){
    if(heldPointers.size||heldTouches){last=now;frame=requestAnimationFrame(draw);return;}
    const dt=Math.min((now-last)/1000,.04);last=now;ctx.clearRect(0,0,width,height);
    particles=particles.filter(p=>p.age<p.life);
    for(const p of particles){
      p.age+=dt;p.trail.push({x:p.x,y:p.y});if(p.trail.length>5)p.trail.shift();
      p.vx*=Math.exp(-.8*dt);p.vy+=28*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      ctx.globalAlpha=Math.max(0,1-p.age/p.life)*.8;ctx.strokeStyle=p.color;ctx.lineWidth=p.size*.65;
      ctx.beginPath();p.trail.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.lineTo(p.x,p.y);ctx.stroke();
      ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;if(particles.length){frame=requestAnimationFrame(draw);}else{frame=0;canvas.hidden=true;ctx.clearRect(0,0,width,height);}
  }
  function celebrate(){
    if(reduced.matches||document.hidden)return;
    timers.forEach(clearTimeout);timers=[];
    [[.08,.2],[.92,.32],[.08,.6]].forEach((point,i)=>timers.push(setTimeout(()=>burst(width*point[0],height*point[1],i),250+i*650)));
  }
  document.getElementById('open').addEventListener('click',()=>setTimeout(celebrate,1100));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&cover.hidden){celebrate();observer.unobserve(entry.target);}});},{threshold:.45});document.querySelectorAll('.hero,.count-section').forEach(section=>observer.observe(section));}
  function clear(){timers.forEach(clearTimeout);timers=[];particles=[];cancelAnimationFrame(frame);frame=0;canvas.hidden=true;ctx.clearRect(0,0,width,height);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});reduced.addEventListener('change',()=>{if(reduced.matches)clear();});
})();

