import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import Home from "src/components/home";

export default function Index() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);
  const [inCall, setInCall] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(user.displayName);
  const [room, setRoom] = useState<string>(user.room);

  const enterCallAction = (e) => {
    e.stopPropagation();
    e.preventDefault();

    dispatch({
      type: "USER_UPDATE_INF0S",
      payload: {
        displayName,
        room,
      },
    });

    setInCall(true);
  };

  const changeDisplayName = (e) => {
    setDisplayName(e.target.value);
  };

  const changeRoom = (e) => {
    setRoom(e.target.value);
  };

  return (
    <div>
      <Head>
        <title>Multicall</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {inCall ? (
        <Home />
      ) : (
        <div className="onboarding">
          <h1>Configuration</h1>
          <p>
            Create or join a full peer-to-peer video conference experience.
            <br />
            See your friends, send chat messages or send files in a secure way!
          </p>
          <form onSubmit={enterCallAction}>
            <label>
              Display Name
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={changeDisplayName}
              />
            </label>
            <label>
              Room
              <input
                type="text"
                placeholder="Room"
                value={room}
                onChange={changeRoom}
              />
            </label>
            <button type="submit" disabled={!displayName || !room}>
              Enter call
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
