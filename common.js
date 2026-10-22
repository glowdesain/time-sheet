const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S={get:()=>JSON.parse(localStorage.getItem('tsu')||'null'),set:u=>localStorage.setItem('tsu',JSON.stringify(u)),clear:()=>localStorage.removeItem('tsu')};
async function call(a,p={}){const u=S.get()||{};const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:a,payload:{...p,_n:u.nama,_t:u.token}})}).then(r=>r.json());
 if(!r.ok){if(/Sesi habis/.test(r.error)){S.clear();location.replace('index.html')}throw new Error(r.error)}return r.data}
function guard(admin){const u=S.get();if(!u){location.replace('index.html');return}if((u.role==='admin')!==admin){location.replace(u.role==='admin'?'admin.html':'karyawan.html');return}return u}
function logout(){if(confirm('Keluar dari aplikasi?')){S.clear();location.replace('index.html')}}
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2600)}
const ymd=d=>d.toLocaleDateString('sv'),hm=d=>d.toTimeString().slice(0,5);
function isoWk(s){const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)+3);const y=d.getUTCFullYear(),j=new Date(Date.UTC(y,0,4));return{y,w:1+Math.round(((d-j)/864e5-3+((j.getUTCDay()+6)%7))/7)}}
function mon(y,w){const j=new Date(Date.UTC(y,0,4));j.setUTCDate(j.getUTCDate()-(j.getUTCDay()||7)+1+(w-1)*7);return j}
const iso=d=>d.toISOString().slice(0,10),shortD=s=>new Date(String(s).slice(0,10)+'T00:00:00Z').toLocaleDateString('id-ID',{day:'numeric',month:'short',timeZone:'UTC'});
const wkLabel=W=>{const m=mon(W.y,W.w),e=new Date(m.getTime()+6*864e5);return `Minggu ${W.w}, ${W.y} · ${shortD(iso(m))} – ${shortD(iso(e))}`};
const shift=(W,n)=>isoWk(iso(new Date(mon(W.y,W.w).getTime()+n*7*864e5)));
const idsOf=r=>String(r.bukti_id||'').split(',').filter(Boolean);
const thumbs=ids=>ids.map(i=>`<a href="https://drive.google.com/file/d/${i}/view" target="_blank"><img src="https://drive.google.com/thumbnail?id=${i}&sz=w200" loading="lazy"></a>`).join('');
const shrink=f=>new Promise(r=>{const i=new Image();i.onload=()=>{const k=Math.min(1,1280/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);const u=c.toDataURL('image/jpeg',.72);URL.revokeObjectURL(i.src);r({mime:'image/jpeg',data:u.split(',')[1],src:u})};i.src=URL.createObjectURL(f)});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
