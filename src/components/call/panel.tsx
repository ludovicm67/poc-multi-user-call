import { useCallback, useContext, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import SocketContext from "src/lib/SocketContext";
import TransferFileContext from "src/lib/TransferFileContext";
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
  const filePool = useContext(TransferFileContext);
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

  const uploadFiles = async () => {
    if (!selectedFiles) {
      console.warn("no file was selected");
      return;
    }

    const file = selectedFiles.file;

    const fileMetadata = await filePool.addFile(file, file.name);
    sm.sendDataChannel(
      {
        type: "file-metadata",
        data: fileMetadata,
      },
      selectedUsers,
      true
    );

    clearSelectedFiles();
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

  const sendButtonAction = async (e) => {
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
      await uploadFiles();
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
