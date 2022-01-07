import { useCallback } from "react";
import { useSelector } from "react-redux";

import { OtherUser } from "src/types/call";

export default function Panel() {
  const stream = useSelector((state: any) => state.user.stream);
  const users: Record<string, OtherUser> = useSelector(
    (state: any) => state.users
  );

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
              {user.displayName} <small>#{user.id}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
