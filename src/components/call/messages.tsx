import { useCallback, useContext, useState } from "react";
import { useSelector } from "react-redux";
import SocketContext from "src/lib/SocketContext";

export default function Messages() {
  const messages = useSelector((state: any) => state.messages);
  const [isBottom, setIsBottom] = useState<boolean>(true);
  const sm = useContext(SocketContext);

  // scroll to the bottom of the messages list on new messages
  const messagesList = useCallback(
    (e) => {
      if (!e) {
        return;
      }

      if (isBottom) {
        e.scrollTop = e.scrollHeight;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isBottom, messages]
  );

  // watch if user is scrolling to see older messages or not
  const scrollAction = (e) => {
    const target = e.target;
    const isBottomList =
      target.scrollTop === target.scrollHeight - target.offsetHeight;

    if (!isBottom && isBottomList) {
      setIsBottom(true);
      return;
    }

    if (isBottom && !isBottomList) {
      setIsBottom(false);
      return;
    }
  };

  const downloadFile = (userId: string, fileId: string) => {
    sm.downloadFile(userId, fileId);
  };

  return (
    <div
      className="multicall-panel-chat-messages"
      onScroll={scrollAction}
      ref={messagesList}
    >
      {messages.map((m) => {
        const chatClass = m.sent
          ? "chat-message-sent"
          : "chat-message-received";
        if (m.type === "chat") {
          return (
            <div key={m.id} className={chatClass}>
              {m.data}
            </div>
          );
        }
        if (m.type === "file" && m.data) {
          const fStatus = m.data.status || "unknown";
          const fName = m.data.name || "(untitled)";
          const fSize = m.data.size || 0;
          const fId = m.data.id || "unknown-id";

          if (m.sent) {
            return (
              <div key={m.id} className={chatClass}>
                <p>
                  <small>Sent the following file:</small>
                </p>
                <ul>
                  <li>
                    Name: <em>{fName}</em>
                  </li>
                  <li>
                    Size: <em>{fSize}</em>
                  </li>
                </ul>
              </div>
            );
          }

          if (fStatus === "metadata" || fStatus === "downloaded") {
            return (
              <div key={m.id} className={chatClass}>
                <p>
                  <small>Received the following file:</small>
                </p>
                <ul>
                  <li>
                    Name: <em>{fName}</em>
                  </li>
                  <li>
                    Size: <em>{fSize}</em>
                  </li>
                </ul>
                <p>
                  <button
                    onClick={() => {
                      downloadFile(m.from, fId);
                    }}
                  >
                    Download
                  </button>
                </p>
              </div>
            );
          } else if (fStatus === "downloading") {
            return (
              <div key={m.id} className={chatClass}>
                <p>
                  <small>Received the following file:</small>
                </p>
                <ul>
                  <li>
                    Name: <em>{fName}</em>
                  </li>
                  <li>
                    Size: <em>{fSize}</em>
                  </li>
                </ul>
                <p>
                  <em>Downloading…</em>
                </p>
              </div>
            );
          } else {
            return (
              <div key={m.id} className={chatClass}>
                <p>
                  <small>Received the following file:</small>
                </p>
                <ul>
                  <li>
                    Name: <em>{fName}</em>
                  </li>
                  <li>
                    Size: <em>{fSize}</em>
                  </li>
                </ul>
                <p>
                  <em>Unknown status</em>
                </p>
              </div>
            );
          }
        }
      })}
    </div>
  );
}
