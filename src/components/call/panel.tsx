import { useCallback, useContext } from "react";
import { useSelector } from "react-redux";

import SocketContext from "src/lib/SocketContext";
import { OtherUser } from "src/types/call";

export default function Panel() {
  const sm = useContext(SocketContext);
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

  const onFileUpload = (e: any) => {
    const target: any = event.target;
    const files = target.files;
    if (!files || !files.length || files.length <= 0) {
      console.warn("no file was selected");
      return;
    }

    const chunkLength = 1000;

    const file = files[0];
    const reader: any = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event, text) => {
      if (event) text = event.target.result;

      let message = "";
      if (text.length > chunkLength) {
        message = text.slice(0, chunkLength);
      } else {
        message = text;
      }
      sm.broadcastDataChannel({
        type: "file",
        data: message,
      });
    };
  };

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
      <div className="multicall-panel-files">
        <input onChange={onFileUpload} type="file" multiple={true} />
      </div>
    </div>
  );
}
