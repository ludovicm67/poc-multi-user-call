// some webrtc config
export const constraints = {
  audio: true,
  video: true,
};

export const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
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
