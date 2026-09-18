const http=require('http'), fs=require('fs'), path=require('path');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')); const port=Number(process.env.PORT||8765);
fs.mkdirSync(path.join(root,'inbox'),{recursive:true});
const types={'.html':'text/html; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.css':'text/css','.js':'text/javascript','.ttf':'font/ttf','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.gif':'image/gif','.mp4':'video/mp4','.webp':'image/webp'};
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x');
  const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS'};
  if(req.method==='OPTIONS'){res.writeHead(204,cors);return res.end();}
  if(req.method==='POST'){ const b=[]; req.on('data',c=>b.push(c)); req.on('end',()=>{ const name=(u.searchParams.get('name')||'page.bin').replace(/[^a-zA-Z0-9._-]/g,'_'); fs.writeFileSync(path.join(root,'inbox',name),Buffer.concat(b)); res.writeHead(200,cors); res.end('saved '+name); }); return; }
  let p=path.normalize(decodeURIComponent(u.pathname)); if(p==='/') p='/index.html';
  const fp=path.join(root,p);
  if(!fp.startsWith(root)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){res.writeHead(404,cors);return res.end('not found');}
  res.writeHead(200,{...cors,'Content-Type':types[path.extname(fp).toLowerCase()]||'application/octet-stream'});
  fs.createReadStream(fp).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('listening',port));
