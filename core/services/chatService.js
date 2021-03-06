const events = require('events');
const chat = require('../domainModel/chat').chat;

const updateInterval = 1000;

module.exports.chatService = class chatService {
  constructor(integrationService) {
    this.telegramIntegrationService = integrationService;
    this.running = false;
    this.intervalId = 0;
    this.chats = [];
    this.lastMessageId = 0;
  }

  /**
   * return the chatlist
   */
  getChatList() {
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
      () => this.telegramIntegrationService.getTelegramMessages(this.lastMessageId).then((receivedData) => {
        this.refreshChatList(receivedData);
      }),
      updateInterval
    );
  }

  sendMessage(chatId, messageText) {
    return new Promise((resolve, reject) => {
      this.telegramIntegrationService.sendMessageToTelegram(chatId, messageText)
        .then((msg) => {
          const currentChat = this.getChatById(chatId);
        
          if (currentChat)
            currentChat.addSentMessage(msg);
        
          resolve(msg);
        })
        .catch((err) => reject(err));
    });
  }

  /**
  * refresh the chat list, create new and add messages
  */
  refreshChatList(receivedData) {
    const result = [...receivedData.result];

    for (let msg of result) {
      let base;
      if (msg.channel_post){
        msg.channel_post.from = {};
        msg.channel_post.from.first_name = 'Chanel';
        msg.channel_post.from.last_name = msg.channel_post.chat.title;
        msg.message = msg.channel_post;
        base = msg.channel_post;
      }
      else {
        base = msg.message;
      }

      const chatId = base.chat.id;

      let currentChat = this.getChatById(chatId);
      if (!currentChat) {
        currentChat = new chat(chatId, `Chat with ${base.from.first_name} ${base.from.last_name}`);
        this.chats.push(currentChat);
      }
      currentChat.addReceivedMessage(msg);
      this.lastMessageId = ++msg.update_id;
    }
  }

  /**
  * stops the chat observation
  */
  stop() {
    if (this.updateId)
      clearInterval(this.updateId);
  }

  /**
   * find an active chat by this id
   */
  getChatById(chatId) {
    var chat;
    for (let chatRoom of this.chats) {
      if (chatRoom.getChatId() === chatId) {
        chat = chatRoom;
        break;
      }
    }
    return chat;
  }
}