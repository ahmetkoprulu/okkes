import { BotCommand } from "../Types/BotCommand";
import PingCommand from "./ping";
import PlayCommand from "./play";
import DisconnectCommand from "./disconnect";
import QueueCommand from "./queue";

export default [
  PingCommand,
  PlayCommand,
  QueueCommand,
  DisconnectCommand,
] as Array<BotCommand>;
