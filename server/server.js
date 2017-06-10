const fs = require('fs');
const Guid = require('guid');
const express = require('express');
const bodyParser = require("body-parser");
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');

const app = express();
const chatService = require('../core/services/chatService').chatService;
const telegramService = require('../core/services/telegramIntegrationService').telegramService;
const service = new chatService(telegramService);
const wsServer = require('ws').Server;
const server = require('http').createServer();

const ws = new wsServer({
  server: server
});

server.on('request', app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

ws.on('connection', function connection(wsc) {
  
  service.chats.forEach((i) => i.setup(ws.send));
  
  wsc.on('message', function incoming(msg) {
    service.sendMessage(msg.chatId, msg.message);
  });
});

var csrfGuid = Guid.raw();
const accountKitApiVersion = 'v1.0';
const appId = '1848667365349936';
const appSecret = '7226ac6000f66cc9284e29e426ba3dcf';
const meEndpointBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/me`;
const tokenExchangeBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/access_token`; 

const port = 8888;

function loadLogin() {
  return fs.readFileSync(__dirname + '/../public/index.html').toString();
}

app.get('/', function(request, response){
  let view = {
    appId: appId,
    csrf: csrfGuid,
    version: accountKitApiVersion,
  };

  let html = Mustache.to_html(loadLogin(), view);
  response.send(html);
});


app.get('/chat', function(request, response){
  const html = Mustache.to_html(fs.readFileSync(__dirname + '/../public/chat.html').toString());
  response.send(html);
});

app.get('/teste', function(request, response){
  const html = Mustache.to_html(fs.readFileSync(__dirname + '/../public/teste.html').toString());
  response.send(html);
});


app.get('/start', function(request, response){
  service.start();
  console.log('started');
  response.send(200);
});

app.post('/sendMessage', function(request, response){  
  let messageText = request.body.message;
  let chatId = parseInt(request.body.chatId);
  service.sendMessage(chatId, messageText).then(() => response.send("Message sent"))
                                          .catch((err) => response.send(err));
});

app.get('/getChats', function(request, response){
  let chats = service.getChatList();
  response.send(chats);
});

app.get('/getChat', function(request, response){
  const chatId = parseInt(request.query.chatId);  
  const chat = service.getChatById(chatId);
  if (chat)
    chat.getAllMessages().then((messages) => response.send(messages));
  else
    response.send("vazio");
});

function loadLoginSuccess() {
  return fs.readFileSync(__dirname + '/../public/login_success.html').toString();
}

app.post('/login_success', function(request, response){

  // CSRF check
  if (request.body.csrf === csrfGuid) {
    let app_access_token = ['AA', appId, appSecret].join('|');
    let params = {
      grant_type: 'authorization_code',
      code: request.body.code,
      access_token: app_access_token
    };
  
    service.start();

    // exchange tokens
    let token_exchange_url = tokenExchangeBaseUrl + '?' + Querystring.stringify(params);
    Request.get({url: token_exchange_url, json: true}, function(err, resp, respBody) {
      let view = {
        user_access_token: respBody.access_token,
        expires_at: respBody.expires_at,
        user_id: respBody.id,	
      };
      response.redirect('/chat');
    });
  } 
  else {
    // login failed
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end("Something went wrong. :( ");
  }
});

app.listen(port, () => {
  console.log(`listening to ${port}`);
});