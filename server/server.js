const fs = require('fs');
const Guid = require('guid');
const express = require('express');
const bodyParser = require("body-parser");
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');
const socketIO = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var csrfGuid = Guid.raw();
const accountKitApiVersion = 'v1.0';
const appId = '1848667365349936';
const appSecret = '7226ac6000f66cc9284e29e426ba3dcf';
const meEndpointBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/me`;
const tokenExchangeBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/access_token`; 

const port = 8888;
const users = new Users();


io.on('connection', (socket) => {

  console.log(users.getRooms());

  socket.emit('roomList', {
    rooms: users.getRooms()
  });

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      callback('Name and room name are required.');
    }

    const room = params.room.toLowerCase();

    users.getUserList(room).forEach((name) => {
      if(name === params.name) {
        callback('Name in use, try another name.');
      }
    })

    socket.join(room);

    users.addUser(socket.id, params.name, room);
    io.to(room).emit('updateUserList', users.getUserList(room));

    socket.emit('newMessage', generateMessage('Admin', `Welcome to the ${room}!`));
    socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${params.name} has joined the chat`));

    callback();

  });

  socket.on('createMessage', (message, callback) => {

    const user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    if(callback) {
      callback('This is from server!');
    }

  });

  socket.on('createLocationMessage', (location) => {
    const user = users.getUser(socket.id);

    io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, location.latitude, location.longitude));
  })

  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} left the room.`));
    }
  });

});

server.listen(port, () => {
  console.log(`App listen to port ${port}`)
});

function loadLogin() {
  return fs.readFileSync('../public/index.html').toString();
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

function loadLoginSuccess() {
  return fs.readFileSync('../public/login_success.html').toString();
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
  
    // exchange tokens
    let token_exchange_url = tokenExchangeBaseUrl + '?' + Querystring.stringify(params);
    Request.get({url: token_exchange_url, json: true}, function(err, resp, respBody) {
      let view = {
        user_access_token: respBody.access_token,
        expires_at: respBody.expires_at,
        user_id: respBody.id,	
      };

      // get account details at /me endpoint
      let me_endpoint_url = meEndpointBaseUrl + '?access_token=' + respBody.access_token;
      Request.get({url: me_endpoint_url, json:true }, function(err, resp, respBody) {
        // send login_success.html
        if (respBody.phone) {
          view.phone_num = respBody.phone.number;
        } else if (respBody.email) {
          view.email_addr = respBody.email.address;
        }
          view.userName = respBody.email.address || respBody.phone.number;
        let html = Mustache.to_html(loadLoginSuccess(), view);
        response.send(html);
      });
    });
  } 
  else {
    // login failed
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end("Something went wrong. :( ");
  }
});

server.listen(port, () => {
  console.log(`listening to ${port}`);
});