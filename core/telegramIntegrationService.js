import request from 'request';

//vicky is the bot's name;
const vickyToken = '371961453:AAHaUcG504xX5ObL0mivPvG27uHVIkYKJO8';

class telegramIntegrationService {
  constructor() {
    this.lastMessageId = 0;
  }
  /**
   * get telegram messages
   */
  static getTelegramMessages(lastMessageId = 0) {
    return new Promise((resolve, reject) => {
      const getUpdateUrl = `https://api.telegram.org/bot${vickyToken}/getUpdates?offset=${lastMessageId}`;

      request.post(getUpdateUrl, { json: true }, function (err, res, body) {
        if (!err && res.statusCode === 200)
          resolve(body);
        else
          reject(err);
      });
    });
  }

  /**
  * send a message by telegram
  */
  static sendMessageToTelegram(chatId, messageText) {
    return new Promise((resolve, reject) => {
      const sendMessageUrl = `https://api.telegram.org/bot${vickyToken}/sendMessage?chat_id=${chatId}&text=${messageText}`;
      request.post(getUpdateUrl, { json: true }, function (err, res, body) {
        if (!err && res.statusCode === 200)
          resolve(body);
        else
          reject(err);
      });
    });
  }
}