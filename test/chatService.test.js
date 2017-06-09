const expect = require('chai').expect;
const service = require('../core/chatService').chatService;
const telegramServiceMock = require('./mock/telegramIntegrationServiceMock').telegramIntegrationServiceMock;

const getValidChatService = () => { return new service(telegramServiceMock); }

describe('chat service tests', () => {
  it('can update chatList', () => {
    const service = getValidChatService();
    telegramServiceMock.getTelegramMessages()
      .then((messages) => service.refreshChatList(messages))
      .then(() => {
        const chats = service.getChatList();
        expect(chats.length).to.eq(1);
      });
  });

  it('can find an active chat'), () => {
    const service = getValidChatService();
    let chatId;
    telegramServiceMock.getTelegramMessages()
      .then((messages) => service.refreshChatList(messages))
      .then(() => {
        const firstChat = service.getChatList()[0];
        const chatFound = service.getChatById(firstChat.chatId);
        expect(firstChat.chatId).to.eq(chatFound.chatId);
      });
  }

  it('can send message', () => {
    const service = getValidChatService();

    telegramServiceMock.getTelegramMessages()
      .then((messages) => service.refreshChatList(messages))
      .then(() => {
        const firstChat = service.getChatList()[0];
        const message = 'Hello Nurse!'
        service.sendMessage(firstChat.chatId, message)
               .then((ret) => expect(ret.ok).to.eq(true));
      });
  })
});