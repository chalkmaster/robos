const events = require('events');
const chat = require('./chat').chat;

const updateInterval = 1000;

module.exports.chatService = class chatService {
  constructor(integrationService) {
    this.telegramIntegrationService = integrationService;
    this.running = false;
    this.intervalId = 0;
    this.chats = [];
  }

  getChatList(){
    return this.chats;
  }

  /**
  * start the chat observation. (listner handler required)
  */
  start() {
    if (this.running)
      return;

    this.running = true;

    this.updateId = setInterval(
      () => this.telegramIntegrationService.getTelegramMessages().then((receivedData) => refreshChatList(receivedData)),
      updateInterval
    );
  }

  refreshChatList(receivedData) {
    const result = [...receivedData.result];

    for (let msg of result) {
      var chatId = msg.message.chat.id;
      var currentChat;

      for (let chatRoom in this.chats) {
        if (chatRoom.getChatId() === chatId)
        {
          currentChat = chatRoom;
          continue;
        }
      }
      
      if (!currentChat)
      {
        currentChat = new chat(chatId, `Chat with ${msg.message.from.first_name} ${msg.message.from.last_name}`);
        this.chats.push(currentChat);
      }
      currentChat.addMessage(msg);
    }
  }

  /**
  * stops the chat observation
  */
  stop() {
    if (this.updateId)
      clearInterval(this.updateId);
  }
}