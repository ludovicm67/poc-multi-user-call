export type User = {
  username: string;
  room: string;
  id: string;
};

export type OtherUser = {
  pc?: RTCPeerConnection,
} & User;
