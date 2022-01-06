import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { constraints } from "src/call/default";
import { OtherUser } from "src/types/call";
import Others from "./others";
import Panel from "./panel";

type CallProps = {
  socket: Socket;
};

const names = [
  "Alice",
  "Bob",
  "Charlie",
  "Dave",
  "Erin",
  "Franck",
  "Jon",
  "Jane",
];

export default function Call({ socket }: CallProps) {
  const randomName = names[Math.floor(Math.random() * names.length)];

  const [stream, setStream] = useState<MediaStream>();
  const [displayName, setDisplayName] = useState<string>(randomName);
  const socketId = socket.id;
  const roomName = "default";

  const [users, setUsers] = useState<Record<string, OtherUser>>({});

  const socketEmit = (type: string, content: any) => {
    if (!socket) {
      console.error("no socket available");
      return;
    }

    socket.emit(type, { ...content, from: socketId });
  };

  socketEmit("user", {
    username: displayName,
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
      <Panel stream={stream} users={users} />
    </div>
  );
}
