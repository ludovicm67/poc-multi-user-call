// some webrtc config
export const constraints = {
  audio: true,
  video: true,
};

export const offerOptions: RTCOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

export const setVideoStream = (videoElement: HTMLVideoElement, stream: MediaSource) => {
  if ("srcObject" in videoElement) {
    videoElement.srcObject = stream;
  } else {
    videoElement.src = window.URL.createObjectURL(stream);
  }

  videoElement.play();
  videoElement.muted = true;
};
