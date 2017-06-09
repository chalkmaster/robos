const expect = require('chai').expect;
const service = require('../core/chatService').chatService;
const telegramMock = require('./telegram').telegram;

const getValidChatService = () => { return new service(telegramMock); }

describe("chat service tests", () => {
  it("can update chatList", () => {
    const service = getValidChatService();
    telegramMock.getTelegramMessages()
                .then((messages) => service.refreshChatList(messages))
                .then(() => {
                  const chats = service.getChatList();
                  expect(chats.length).to.eq(1);
                });
    });
});