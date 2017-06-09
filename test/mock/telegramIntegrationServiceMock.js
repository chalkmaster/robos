const receivedMessageStub = {
  "ok": true,
  "result": [
    {
      "update_id": 527770899,
      "message": {
        "message_id": 4,
        "from": {
          "id": 286894193,
          "first_name": "Charles",
          "last_name": "Fortes",
          "language_code": "pt-BR"
        },
        "chat": {
          "id": 286894193,
          "first_name": "Charles",
          "last_name": "Fortes",
          "type": "private"
        },
        "date": 1496888115,
        "text": "Olá"
      }
    }
  ],
};

const sentMessageStub = {
  "ok": true,
  "result": {
    "message_id": 5,
    "from": {
      "id": 371961453,
      "first_name": "vicky",
      "username": "RobosChallangeVickyBot"
    },
    "chat": {
      "id": 286894193,
      "first_name": "Charles",
      "last_name": "Fortes",
      "type": "private"
    },
    "date": 1496888604,
    "text": "Colé!"
  }
};

module.exports.telegramIntegrationServiceMock = class telegramIntegrationServiceMock {
  constructor() {
    this.lastMessageId = 0;
  }
  /**
   * get telegram messages
   */
  static getTelegramMessages(lastMessageId = 0) {
    return new Promise((resolve, reject) => {
      resolve(receivedMessageStub);
    });
  }

  /**
  * send a message by telegram
  */
  static sendMessageToTelegram(chatId, messageText) {
    return new Promise((resolve, reject) => {
      resolve(sentMessageStub);
    });
  }
}