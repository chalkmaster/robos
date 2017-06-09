const events = require('events');
const chat = require('./chat').chat;

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
      () => this.telegramIntegrationService.getTelegramMessages(this.lastMessageId).then((receivedData) => {
        this.refreshChatList(receivedData);
      }),
      updateInterval
    );
  }

  sendMessage(chatId, messageText){    
    this.telegramIntegrationService.sendMessageToTelegram(chatId, messageText).then((msg) => {
      var chatId = msg.result.chat.id;
      var currentChat;
      for (let chatRoom of this.chats) {
        if (chatRoom.getChatId() === chatId)
        {
          currentChat = chatRoom;
          continue;
        }
      }
      currentChat.addSentMessage(msg);      
    });
  }
  /**
  * refresh the chat list, create new and add messages
  */
  refreshChatList(receivedData) {
    const result = [...receivedData.result];

    for (let msg of result) {
      var chatId = msg.message.chat.id;
      var currentChat;
      this.lastMessageId = ++msg.update_id;
      for (let chatRoom of this.chats) {
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