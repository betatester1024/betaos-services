const express = require('express')
const app = express()
const crypto = require("crypto");
const parse = require("co-body");
 // for generating secure random #'s
import {frontendDir, jsDir, rootDir, roomRegex, port, uDB} from './consts';
import {signup, validateLogin, logout} from './validateLogin';
import {delAcc} from './delacc';
import {updateUser} from './updateUser'
import {userRequest} from './userRequest';
import {EE} from './EEHandler';
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
import {supportHandler, roomRequest, sendMsg} from './supportRooms'
const urlencodedParser = bodyParser.urlencoded({ extended: false }) 
var RateLimit = require('express-rate-limit');

export async function initServer() {
  var limiter = RateLimit({
    windowMs: 10*1000, // 10 seconds
    max: 50,
    message: "Too many requests, please try again later.",
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
  });
  app.use(limiter);
  app.use(new cookieParser());
  
  app.get('/', (req:Request, res:any) => {
    res.sendFile(frontendDir+'/index.html');
    incrRequests();
  })

  app.get('/login', (req:any, res:any) => {
    res.sendFile(frontendDir+'/login.html');
    incrRequests();
  });

  app.get('/signup', (req:any, res:any) => {
    res.sendFile(frontendDir+'/signup.html');
    incrRequests();
  });

  app.get('/config', (req:any, res:any) => {
    res.sendFile(frontendDir+'/config.html');
    incrRequests();
  });

  app.get('/account', (req:any, res:any) => {
    res.sendFile(frontendDir+'/config.html');
    incrRequests();
  });

  app.get('/admin', (req:any, res:any) => {
    res.sendFile(frontendDir+'/admin.html');
    incrRequests();
  });

  app.get('/todo', (req:any, res:any) => {
    res.sendFile(frontendDir+'/todo.html');
    incrRequests();
  });

  app.get('/status', (req:any, res:any) => {
    res.sendFile(frontendDir+'/status.html');
    incrRequests();
  });
  
  app.get('/EE', (req:any, res:any) => {
    EE(true, (_status:string, data:any, _token:string)=>{
      res.set('Content-Type', 'text/html')
      res.send(Buffer.from(`<!DOCTYPE html>
<html>
  <head>
    <script src='./utils.js'></script>
    <title>Everyone Edits | BetaOS Systems</title>
    <script>
    </script>
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Display:wght@100;400;700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="/globalformat.css">
    <style>
    </style>
  </head>
  <body onload = "globalOnload();">
    <div class="main_content">
    <header>
      <h2>Everybody edits!</h2>
      <hr class="rounded">
    </header>
      ${data.data}
    </div>
    
    <div class="overlay" id="overlay">
      <div class="internal">
        <p class="fsmed" id="alerttext">Hey, some text here</p>
        <button class="btn szTwoThirds" onclick="closeAlert()">
          Continue
          <span class="material-symbols-outlined">arrow_forward_ios</span>
          <div class="anim"></div>
        </button>
      </div>
    </div>
  </body>
</html>`));
    }, "", "")
    
    incrRequests();
  });

  app.get('/docs', (req:any, res:any) => {
    res.sendFile(frontendDir+'/docs.html');
    incrRequests();
  });
  
  app.get('/EEdit', (req:any, res:any) => {
    res.sendFile(frontendDir+'/EEdit.html');
    incrRequests();
  });
  
  app.get('/logout', (req:any, res:any) => {
    res.sendFile(frontendDir+'/logout.html');
    incrRequests();
  });

  app.get('/support', (req:any, res:any) => {
    let match = req.url.match('\\?room=('+roomRegex+")");
    if (match) {
      if (!supportHandler.checkFoundQ(match[1])) {
        console.log("Room not found")
        res.sendFile(frontendDir+"/room404.html");
        return;
      }
      else res.sendFile(frontendDir+'/support.html');
    }
    else res.sendFile(frontendDir+'/supportIndex.html');
    incrRequests();
  });

  app.get('/accountDel', (req:any, res:any) => {
    res.sendFile(frontendDir+'/delAcc.html');
    incrRequests();
  });
    
  app.get('*/favicon.ico', (req:Request, res:any)=> {
    res.sendFile(rootDir+'/favicon.ico')
    incrRequests();
  })

  
  app.get('/support.js', (req:any, res:any) => {
    res.sendFile(frontendDir+"support.js");
    incrRequests();
  })
  
  app.get('/*.js*', (req:any, res:any) => {
    res.sendFile(jsDir+req.url);
    incrRequests();
  })

  
  app.get('/*.ts', (req:any, res:any) => {
    res.sendFile(jsDir+req.url);
    incrRequests();
  })

  app.get('/*.css', (req:any, res:any) => {
    res.sendFile(frontendDir+req.url);
    incrRequests();
  })

  app.get("/stream", (req:any, res:any) =>{
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();
    res.write("retry:500\n\n");
    // add the connection
    supportHandler.addConnection(res, req.query.room, req.cookies.sessionID);
    res.on("close", () => {
      // clear the connection
      supportHandler.removeConnection(res, req.query.room, req.cookies.sessionID);
      res.end();
      // console.log("Removed stream");
    });
  });

  app.get('/*', (req:any, res:any) => {
    res.sendFile(frontendDir+"404.html");
    incrRequests();
  })
  
  
  app.post('/server', urlencodedParser, async (req:any, res:any) => {
    incrRequests();
    var body = await parse.json(req);
    if (!body) res.end(JSON.stringify({status:"ERROR", data:null}));
    // let cookiematch = req.cookies.match("sessionID=[0-9a-zA-Z\\-]");
    makeRequest(body.action, req.cookies.sessionID, body.data, (s:string, d:any, token:string)=>{
      /*if(body.action=="login"||body.action == "logout" ||
        body.action == "delAcc" || body.action == "signup")*/
      if (body.action != "sendMsg") res.cookie('sessionID', token?token:"", { maxAge: 1000*60*60*24*30, httpOnly: true, secure:true, sameSite:"Strict"});
      res.end(JSON.stringify({status:s, data:d}));
    })
  });
  
  app.listen(port, () => {
    console.log(`BetaUtilities V2 listening on port ${port}`)
  })
}

async function incrRequests() {
  let ct:{visitCt:number} = await uDB.findOne({fieldName:"VISITS"});
  uDB.updateOne({fieldName:"VISITS"}, {$set:{visitCt:ct.visitCt+1}}, {upsert:true});
}

function makeRequest(action:string|null, token:string, data:any|null, callback: (status:string, data:any, token:string)=>any) {
  switch (action) {
    case 'test':
      callback("SUCCESS", {abc:"def", def:5}, token);
      break;
    case 'login': 
      // validate login-data before sending to server
      data = data as {user:string, pass:string};
      validateLogin(data.user, data.pass, callback, token);
      break;
    case 'signup':
      data = data as {user:string, pass:string};
      signup(data.user, data.pass, callback, token);
      break;
    case 'userRequest': 
      userRequest(callback, token);
      break;
    case 'roomRequest':
      roomRequest(callback, token);
      break;
    case 'statusRequest':
      roomRequest(callback, token, true);
    case 'getEE':
      EE(true, callback, token, "");
      break;
    case 'setEE':
      data = data as {data:string}
      EE(false, callback, token, data.data);
      break;
    case 'updateuser': 
      data = data as {user:string, oldPass: string, pass:string, newPermLevel:string};
      updateUser(data.user, data.oldPass, data.pass, data.newPermLevel, callback, token);
      break;
    case 'delAcc':
      data = data as {user:string, pass:string};
      delAcc(data.user, data.pass, callback, token);
      break;
    case 'logout':
      logout(callback, token);
      break;
    case 'logout_all':
      logout(callback, token, true);
      break;
    case 'sendMsg':
      data = data as {msg:string, room:string};
      sendMsg(data.msg, data.room, callback, token);
    default:
      callback("ERROR", {error: "Unknown command string!"}, token);
  }
  return; 
}