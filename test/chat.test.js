const expect = require('chai').expect;
const chat = require('../core/chat').chat;

const getValidChat = () => { return new chat(1, 'chatTest'); }

const messageStub = {
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
    "text": "Hello Nurse"
  }
};

describe("chat struct tests", () => {
  describe("message tests", () => {
    it("can add a new message", () => {
      getValidChat().addMessage(messageStub).then((messages) => {
        expect(messages.length).to.eq(1);
      });
    });

    it("can get all messages", () => {
      const chat = getValidChat();
      chat.addMessage(messageStub).then(() => {
        chat.getAllMessages().then((m) => expect(m.length).to.eq(1))
      });
    });

    it("can receive new message notification", ()=>{
      const chat = getValidChat();
      var received = {};

      chat.setup((msg)=>  {
        received = msg.mesageText;
        expect(received).to.eq(messageStub.text);
      });

      chat.addMessage(messageStub);
    })
  });
});