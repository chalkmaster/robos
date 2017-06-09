const events = require('events');

const onMessageReceivedEventKey = 'messageReceived';
const emitter = new events.EventEmitter();

module.exports.chat = class chat {
  constructor(chatId, chatName) {
    this.chatId = chatId;
    this.chatName = chatName;
    this.messages = [];
  }

  /**
   * return current chat id
   */
  getChatId() {
    return this.chatId;
  }
  /**
   * configure a listner to receive the new messages
   */
  setup(eventHandler) {
    emitter.addListener(onMessageReceivedEventKey, eventHandler);
  }

  /**
   * update the message list with all new messages
   */
  addReceivedMessage(msg) {
    return new Promise((resolve, reject) => {
      try {
        this.lastMessageId = msg.update_id;
        const name = `${msg.message.from.first_name} ${msg.message.from.last_name}`;
        const receivedMsg = {
          userName: name,
          messageType: 'received',
          receivedAt: new Date(msg.message.date),
          messageText: msg.message.text,
        };
        this.messages.push(receivedMsg);
        emitter.emit(onMessageReceivedEventKey, receivedMsg);
        resolve(this.messages);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * add messages sent by vicky
   */
  addSentMessage(msg) {
    return new Promise((resolve, reject) => {
      try {
        const name = `${msg.result.from.first_name}`;
        const sentMessage = {
          userName: name,
          messageType: 'sent',
          receivedAt: new Date(msg.result.date),
          messageText: msg.result.text,
        };
        this.messages.push(sentMessage);
        emitter.emit(onMessageReceivedEventKey, sentMessage);
        resolve(this.messages);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * return all loaded messagens in memory
   */
  getAllMessages() {
    return new Promise((resolve, reject) => {
      resolve(this.messages);
    });
  }
}