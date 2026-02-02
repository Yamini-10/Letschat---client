export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: User[];
  lastMessage: {content: string};
  updatedAt: string;
}
