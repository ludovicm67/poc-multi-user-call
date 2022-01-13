import { useSelector } from "react-redux";

export default function Messages() {
  const messages = useSelector((state: any) => state.messages);

  return (
    <div className="chat-container">
      {messages.map((m) => {
        if (m.sent) {
          return (
            <div key={m.id} className="chat-message-sent">
              {m.data}
            </div>
          );
        } else {
          return (
            <div key={m.id} className="chat-message-received">
              {m.data}
            </div>
          );
        }
      })}
    </div>
  );
}
