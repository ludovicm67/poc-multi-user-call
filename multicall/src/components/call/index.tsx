import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { constraints } from "src/call/default";
import { OtherUser, User } from "src/types/call";
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

const listenUser = (
  socketId: string,
  users: Record<string, OtherUser>,
  data: Record<string, User>,
  setUsers: Dispatch<Record<string, OtherUser>>
) => {
  if (!socketId) {
    return;
  }

  const newUsers: Record<string, OtherUser> = {};
  const dataUsers = Object.values(data);
  const dataUsersId = dataUsers.map((u) => u.id);

  // remove old users from the list
  Object.values(users)
    .filter((u) => dataUsersId.includes(u.id))
    .forEach((u) => {
      newUsers[u.id] = u;
    });

  dataUsers.forEach(async (u) => {
    if (u.id === socketId) {
      return;
    }

    if (!newUsers.hasOwnProperty(u.id)) {
      newUsers[u.id] = u;
    }

    if (!newUsers[u.id].hasOwnProperty("pc")) {
    }
  });

  setUsers(newUsers);
};

export default function Call({ socket }: CallProps) {
  const randomName = names[Math.floor(Math.random() * names.length)];

  const [stream, setStream] = useState<MediaStream>();
  const [displayName, setDisplayName] = useState<string>(randomName);
  const [sentInit, setSentInit] = useState<boolean>(false);
  const roomName = "default";

  const [users, setUsers] = useState<Record<string, OtherUser>>({});

  const socketEmit = (type: string, content: any) => {
    if (!socket) {
      console.error("no socket available");
      return;
    }

    socket.emit(type, content);
  };

  if (!sentInit) {
    setSentInit(true);
    socketEmit("user", {
      username: displayName,
      room: roomName,
    });
  }

  // initialize local video stream
  useEffect(() => {
    (async () => {
      const myStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(myStream);
    })();
  }, [setStream]);

  useEffect(() => {
    if (!socket) {
      console.error("no socket available");
      return;
    }

    socket.on("user", (data) => listenUser(socket.id, users, data, setUsers));

    return () => {
      socket.off("user");
    };
  }, [socket, users, setUsers]);

  return (
    <div className="multicall-app">
      <Others />
      <Panel stream={stream} users={users} />
    </div>
  );
}
