import { OtherUser } from "src/types/call";

type UserProps = {
  user: OtherUser;
};

export default function User({ user }: UserProps) {
  if (!user.pc) {
    return <div>{user.username} (no direct connection)</div>;
  }

  if (!user.stream) {
    return <div>{user.username} (no stream)</div>;
  }

  return <div>{user.username} (connected)</div>;
}
