/* G-ONE service worker — cache-first: aplikasi langsung terbuka dari memori HP,
   versi terbaru diunduh di latar belakang dan dipakai pada pembukaan berikutnya */
const C="gone-flag-2026-11-23";
const FILES=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
async function refresh(req,key,notify){
  try{const r=await fetch(notify?"./index.html":req.url,{cache:"no-cache"});if(!r||!r.ok)return;const c=await caches.open(C);const old=await c.match(key);
    let changed=false;if(notify&&old){const [a,b]=await Promise.all([old.clone().text(),r.clone().text()]);changed=a!==b;}
    await c.put(key,r.clone());
    if(changed){const cl=await self.clients.matchAll({type:"window"});cl.forEach(w=>w.postMessage({t:"upd"}));}
  }catch(_){}
}
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const url=new URL(req.url);if(url.origin!==location.origin)return;
  const nav=req.mode==="navigate";const key=nav?"./index.html":req;
  e.respondWith(caches.open(C).then(c=>c.match(key,{ignoreSearch:nav})).then(hit=>{
    const upd=refresh(req,key,nav);
    if(hit){e.waitUntil(upd);return hit;}
    return fetch(req).catch(()=>caches.match("./index.html"));
  }));
});
