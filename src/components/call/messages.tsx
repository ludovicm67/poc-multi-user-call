import { useSelector } from "react-redux";

export default function Messages() {
  const messages = useSelector((state: any) => state.messages);

  return (
    <div className="multicall-panel-chat-messages">
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
        if (m.type === "file") {
          if (!m?.data?.complete) {
            return (
              <div key={m.id} className={chatClass}>
                File: {m.data.name} (downloading…)
              </div>
            );
          }

          return (
            <div key={m.id} className={chatClass}>
              <a href={m.data.content} download={m.data.name}>
                File: {m.data.name}
              </a>
            </div>
          );
        }
      })}
    </div>
  );
}
