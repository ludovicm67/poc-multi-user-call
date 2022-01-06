export type User = {
  username: string;
  room: string;
};

export type OtherUser = {
  pc?: RTCPeerConnection,
} & User;
