import { BotCommand } from "../Types/BotCommand";
import PingCommand from "./ping";
import PlayCommand from "./play";
import PauseCommand from "./pause";
import ResumeCommand from "./resume";
import SkipCommand from "./skip";
import QueueCommand from "./queue";
import DisconnectCommand from "./disconnect";
import LoopCommand from "./loop";

export default [
  PingCommand,
  PlayCommand,
  LoopCommand,
  PauseCommand,
  ResumeCommand,
  SkipCommand,
  QueueCommand,
  DisconnectCommand,
] as Array<BotCommand>;
