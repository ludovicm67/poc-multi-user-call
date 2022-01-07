export type User = {
  displayName: string;
  room: string;
  id: string;
};

export type OtherUser = {
  pc?: RTCPeerConnection;
  stream?: MediaStream;
  dc?: RTCDataChannel;
} & User;
