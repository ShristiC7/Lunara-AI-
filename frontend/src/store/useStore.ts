interface Message {
  type: string;
  text: string;
}

interface Store {
  messages: Message[];
  addMessage: (msg: Message) => void;
}