const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S={get:()=>JSON.parse(localStorage.getItem('tsu')||'null'),set:u=>localStorage.setItem('tsu',JSON.stringify(u)),clear:()=>localStorage.removeItem('tsu')};
async function call(a,p={}){const u=S.get()||{};const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:a,payload:{...p,_n:u.nama,_t:u.token}})}).then(r=>r.json());
 if(!r.ok){if(/Sesi habis/.test(r.error)){S.clear();location.replace('index.html')}throw new Error(r.error)}if(r.data===undefined)throw new Error('Respons server tidak lengkap: '+JSON.stringify(r).slice(0,160));return r.data}
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

const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],p2=x=>String(x).padStart(2,'0');
function pRange(m,a){const d=new Date(a+'T00:00:00Z');
 if(m==='w'){const k=(d.getUTCDay()+6)%7,s=new Date(d.getTime()-k*864e5),e=new Date(s.getTime()+6*864e5),W=isoWk(a);return{dari:iso(s),sampai:iso(e),label:`Minggu ${W.w}, ${W.y} · ${shortD(iso(s))} – ${shortD(iso(e))}`}}
 const y=d.getUTCFullYear(),o=d.getUTCMonth();
 if(m==='m')return{dari:iso(new Date(Date.UTC(y,o,1))),sampai:iso(new Date(Date.UTC(y,o+1,0))),label:BLN[o]+' '+y};
 return{dari:y+'-01-01',sampai:y+'-12-31',label:'Tahun '+y}}
function pMove(m,a,n){const d=new Date(a+'T00:00:00Z');if(m==='w')d.setUTCDate(d.getUTCDate()+7*n);else if(m==='m')d.setUTCMonth(d.getUTCMonth()+n,1);else d.setUTCFullYear(d.getUTCFullYear()+n,0,1);return iso(d)}
async function loadPeriode(m,a,nama){const R=pRange(m,a);const r=await call('ts.list',{dari:R.dari,sampai:R.sampai,...(nama?{nama}:{})});
 return r.map(x=>({...x,tanggal:String(x.tanggal).slice(0,10)})).filter(x=>x.tanggal>=R.dari&&x.tanggal<=R.sampai).sort((x,y)=>(x.nama+x.tanggal+x.jam_dari).localeCompare(y.nama+y.tanggal+y.jam_dari))}
const agg=r=>({jam:r.reduce((s,x)=>s+(+x.durasi_jam||0),0),n:r.length,hari:new Set(r.map(x=>x.nama+x.tanggal)).size});
const group=(r,f)=>{const g={};r.forEach(x=>(g[f(x)]=g[f(x)]||[]).push(x));return g};
function breakdown(m,rows){const g=group(rows,r=>m==='m'?isoWk(r.tanggal).w:r.tanggal.slice(5,7)),ks=Object.keys(g).sort((a,b)=>a-b),T=agg(rows);
 return '<div class="sc"><table><tr><th>'+(m==='m'?'Minggu':'Bulan')+'</th><th>Jam</th><th>Kegiatan</th><th>Hari</th></tr>'+ks.map(k=>{const a=agg(g[k]),d=g[k][0].tanggal;
  return `<tr class="dg" data-m2="${m==='m'?'w':'m'}" data-go="${m==='m'?d:d.slice(0,7)+'-01'}"><td>${m==='m'?'Minggu '+k:BLN[+k-1]}</td><td>${a.jam.toFixed(1)}</td><td>${a.n}</td><td>${a.hari}</td></tr>`}).join('')+`<tr><th>Total</th><th>${T.jam.toFixed(1)}</th><th>${T.n}</th><th>${T.hari}</th></tr></table></div><p class="mut">Ketuk satu baris untuk melihat rinciannya.</p>`}
const bindDrill=cb=>$$('tr.dg').forEach(t=>t.onclick=()=>cb(t.dataset.m2,t.dataset.go));
