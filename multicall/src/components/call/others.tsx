import { useSelector } from "react-redux";

import { OtherUser } from "src/types/call";
import Alone from "./alone";
import User from "./user";

export default function Others() {
  const users: Record<string, OtherUser> = useSelector(
    (state: any) => state.users
  );
  const others = Object.values(users);

  if (others.length === 0) {
    return (
      <div className="multicall-others">
        <Alone />
      </div>
    );
  }

  return (
    <div className="multicall-others">
      {others.map((o) => (
        <User key={o.id} user={o} />
      ))}
    </div>
  );
}
