import { useCallback, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import SocketContext from "src/lib/SocketContext";
import { OtherUser } from "src/types/call";
import Messages from "./messages";

type FileContainer = {
  file: File;
  id: string;
};

const CHUNK_LENGTH = 1_000;

export default function Panel() {
  const dispatch = useDispatch();

  const [selectedFiles, setSelectedFiles] = useState<FileContainer>();
  const [message, setMessage] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

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

  const sendFile = (event, text) => {
    const fileName = selectedFiles.file.name;
    const fileId = selectedFiles.id;
    let first = false;
    let last = false;
    let multipart = true;

    if (event) {
      first = true;
      text = event.target.result;

      dispatch({
        type: "MESSAGES_SENT",
        payload: {
          id: fileId,
          type: "file",
          data: {
            content: text,
            name: fileName,
            complete: true,
          },
        },
      });
    }

    let message = "";
    if (text.length > CHUNK_LENGTH) {
      message = text.slice(0, CHUNK_LENGTH);
    } else {
      message = text;
      last = true;
      setSelectedFiles(undefined);
      if (event) {
        multipart = false;
      }
    }
    sm.sendDataChannel(
      {
        type: "file",
        data: {
          id: fileId,
          name: fileName,
          message,
          multipart,
          first,
          last,
        },
      },
      selectedUsers,
      true
    );

    const remainingDataURL = text.slice(message.length);
    if (remainingDataURL.length) {
      setTimeout(function () {
        sendFile(null, remainingDataURL);
      }, 200);
    }
  };

  const uploadFiles = () => {
    if (!selectedFiles) {
      console.warn("no file was selected");
      return;
    }

    const file = selectedFiles.file;

    const reader: any = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = sendFile;
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
      sm.sendDataChannel(
        {
          type: "chat",
          data: {
            id: chatId,
            message,
            last,
          },
        },
        selectedUsers,
        true
      );
      dispatch({
        type: "MESSAGES_SENT",
        payload: {
          id: chatId,
          type: "chat",
          data: message,
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

  const changeDest = (e) => {
    const userId = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      if (!selectedUsers.includes(userId)) {
        setSelectedUsers([...selectedUsers, userId]);
      }
    } else {
      setSelectedUsers(selectedUsers.filter((u) => u !== userId));
    }
  };

  return (
    <div className="multicall-panel">
      {stream && <video ref={myVideo}></video>}
      {!stream && <p>No local video stream</p>}
      <Messages />
      <div className="multicall-panel-exchange">
        {Object.entries(users).map((u) => {
          const user = u[1];
          return (
            <p key={`select-user-dest-${user.id}`}>
              <label>
                <input
                  type="checkbox"
                  value={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onChange={changeDest}
                />{" "}
                {user.displayName} <small>#{user.id}</small>
              </label>
            </p>
          );
        })}
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
