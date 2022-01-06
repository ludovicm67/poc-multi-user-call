import { useCallback } from "react";
import { OtherUser } from "src/types/call";

type PanelProps = {
  stream: MediaStream;
  users: Record<string, OtherUser>;
};

export default function Panel({ stream, users }: PanelProps) {
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
      <ul>
        {Object.entries(users).map((u) => {
          const user = u[1];
          return (
            <li key={user.id}>
              {user.username} <small>#{user.id}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
