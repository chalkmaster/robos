const fs = require('fs');
const Guid = require('guid');
const express = require('express');
const bodyParser = require("body-parser");
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var csrfGuid = Guid.raw();
const accountKitApiVersion = 'v1.0';
const appId = '1848667365349936';
const appSecret = '7226ac6000f66cc9284e29e426ba3dcf';
const meEndpointBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/me`;
const tokenExchangeBaseUrl = `https://graph.accountkit.com/${accountKitApiVersion}/access_token`; 

const vickyToken = '371961453:AAHaUcG504xX5ObL0mivPvG27uHVIkYKJO8';
const updateMethod = 'getUpdates';
let lastMessageId = 0;
const telegramBotGetUpdateUrl = `https://api.telegram.org/bot${vickyToken}/${updateMethod}?offset=${lastMessageId}`;
const telegramBotSendMessageUrl = `https://api.telegram.org/bot${vickyToken}/${updateMethod}?offset=${lastMessageId}`;

const port = 8888;

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

app.listen(port, () => {
  console.log(`listening to ${port}`);
});