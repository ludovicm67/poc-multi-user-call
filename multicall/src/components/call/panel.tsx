import { useCallback } from "react";

type PanelProps = {
  stream: MediaStream;
};

export default function Panel({ stream }: PanelProps) {
  const myVideo = useCallback(
    (video) => {
      if (!video) {
        return;
      }

      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(
          stream as unknown as MediaSource
        );
      }

      video.play();
      video.muted = true;
    },
    [stream]
  );

  return (
    <div className="multicall-panel">
      {stream && <video ref={myVideo}></video>}
      {!stream && <p>No local video stream</p>}
    </div>
  );
}
