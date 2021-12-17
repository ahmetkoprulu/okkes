import { BotCommand } from "../Types/BotCommand";
import PingCommand from "./ping";
import PlayCommand from "./play";

export default [PingCommand, PlayCommand] as Array<BotCommand>;
