import { OtherUser } from "src/types/call";
import Alone from "./alone";
import User from "./user";

type OthersProps = {
  users: Record<string, OtherUser>;
};

export default function Others({ users }: OthersProps) {
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
