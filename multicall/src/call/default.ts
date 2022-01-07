// some webrtc config
export const constraints = {
  audio: true,
  video: true,
};

export const offerOptions: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};
