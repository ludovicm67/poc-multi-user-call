import { useCallback, useState } from "react";
import { useSelector } from "react-redux";

export default function Messages() {
  const messages = useSelector((state: any) => state.messages);
  const [isBottom, setIsBottom] = useState<boolean>(true);

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
      })}
    </div>
  );
}
