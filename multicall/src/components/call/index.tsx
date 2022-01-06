import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { constraints } from "src/call/default";
import Others from "./others";
import Panel from "./panel";

type CallProps = {
  socket: Socket;
};

export default function Call({ socket }: CallProps) {
  const [stream, setStream] = useState<MediaStream>();
  const socketId = socket.id;
  const roomName = "default";

  const socketEmit = (type: string, content: any) => {
    if (!socket) {
      console.error("no socket available");
      return;
    }

    socket.emit(type, { ...content, from: socketId });
  };

  socketEmit("new user", {
    username: socketId,
    room: roomName,
  });

  // initialize local video stream
  useEffect(() => {
    (async () => {
      const myStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(myStream);
    })();
  }, [setStream]);

  return (
    <div className="multicall-app">
      <Others />
      <Panel stream={stream} />
    </div>
  );
}
