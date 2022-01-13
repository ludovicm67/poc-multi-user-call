import { useCallback, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import SocketContext from "src/lib/SocketContext";
import { OtherUser } from "src/types/call";

type FileContainer = {
  file: File;
  id: string;
};

const CHUNK_LENGTH = 1_000;

export default function Panel() {
  const [selectedFiles, setSelectedFiles] = useState<FileContainer>();
  const [message, setMessage] = useState<string>("");

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

  const uploadFiles = () => {
    if (!selectedFiles) {
      console.warn("no file was selected");
      return;
    }

    const file = selectedFiles.file;
    const fileId = selectedFiles.id;
    let last = false;

    const reader: any = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event, text) => {
      if (event) text = event.target.result;

      let message = "";
      if (text.length > CHUNK_LENGTH) {
        message = text.slice(0, CHUNK_LENGTH);
      } else {
        message = text;
        last = true;
        setSelectedFiles(undefined);
      }
      sm.broadcastDataChannel({
        type: "file",
        data: {
          id: fileId,
          message,
          last,
        },
      });
    };
  };

  const selectFile = (e: any) => {
    const target: any = e.target;
    const files = target.files;
    if (!files || !files.length || files.length <= 0) {
      return;
    }

    const fileContainer: FileContainer = {
      file: files[0],
      id: uuidv4(),
    };

    setSelectedFiles(fileContainer);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles(undefined);
  };

  const sendButtonAction = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (message) {
      const last = true;
      const chatId = uuidv4();
      sm.broadcastDataChannel({
        type: "chat",
        data: {
          id: chatId,
          message,
          last,
        },
      });
      setMessage("");
    }

    if (selectedFiles) {
      uploadFiles();
    }
  };

  const changeMessage = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="multicall-panel">
      {stream && <video ref={myVideo}></video>}
      {!stream && <p>No local video stream</p>}
      <div className="multicall-panel-exchange">
        <div className="multicall-panel-chat-messages"></div>
        {/* <ul>
          {Object.entries(users).map((u) => {
            const user = u[1];
            return (
              <li key={user.id}>
                {user.displayName} <small>#{user.id}</small>
              </li>
            );
          })}
        </ul> */}
        <form
          className="multicall-panel-chat-input"
          onSubmit={sendButtonAction}
        >
          {!selectedFiles && (
            <div className="multicall-panel-text">
              <input
                type="text"
                placeholder="Your message here…"
                value={message}
                onChange={changeMessage}
              />
            </div>
          )}

          {!message && !selectedFiles && (
            <div className="multicall-panel-file-button">
              <label htmlFor="chat-file-input">File?</label>
              <input
                id="chat-file-input"
                onChange={selectFile}
                type="file"
                multiple={false}
              />
            </div>
          )}
          {!message && selectedFiles && (
            <div className="multicall-panel-file-button-selected">
              <label htmlFor="chat-file-input">{selectedFiles.file.name}</label>
              <input
                id="chat-file-input"
                onChange={selectFile}
                type="file"
                multiple={false}
              />
              <button type="button" onClick={clearSelectedFiles}>
                ✕
              </button>
            </div>
          )}

          {(message || selectedFiles) && (
            <div className="multicall-panel-send-button">
              <button type="submit">Send »</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
