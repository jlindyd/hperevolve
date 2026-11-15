// Local QA bridge. No API key is loaded; real answers are verified after deployment setup.
const http=require('http'),fs=require('fs'),path=require('path');
const handler=require('./api/agent.js');
const root=path.resolve('dist');
http.createServer(async(req,res)=>{
 if(req.url.split('?')[0]==='/api/agent'){
  let text='';for await(const chunk of req){text+=chunk;if(text.length>20000){res.writeHead(413);res.end();return}}
  try{req.body=text?JSON.parse(text):undefined}catch{req.body=null}
  res.status=n=>{res.statusCode=n;return res};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));return res};
  return handler(req,res);
 }
 let route=decodeURIComponent(req.url.split('?')[0]);if(route==='/')route='/index.html';if(route==='/demo')route='/demo.html';
 const file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 try{const data=fs.readFileSync(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end('Not found')}
}).listen(8771,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:8771'));
