import { useCallback, useEffect } from "react";
import { OtherUser } from "src/types/call";

type UserProps = {
  user: OtherUser;
};

export default function User({ user }: UserProps) {
  const video = useCallback(
    (video) => {
      if (!video) {
        return;
      }

      if ("srcObject" in video) {
        video.srcObject = user.stream;
      } else {
        video.src = window.URL.createObjectURL(
          user.stream as unknown as MediaSource
        );
      }

      video.play();
      video.muted = true;
    },
    [user.stream]
  );

  if (!user.pc) {
    return (
      <div className="multicall-others-user">
        <div className="blank">(No Direct Connection)</div>
        <p>{user.displayName}</p>
      </div>
    );
  }

  if (!user.stream) {
    return (
      <div className="multicall-others-user">
        <div className="blank">(No Stream)</div>
        <p>{user.displayName}</p>
      </div>
    );
  }

  return (
    <div className="multicall-others-user">
      <video ref={video}></video>
      <p>{user.displayName}</p>
    </div>
  );
}
