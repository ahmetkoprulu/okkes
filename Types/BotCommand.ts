import {
  CommandInteraction,
  CacheType,
  ChatInputApplicationCommandData,
} from "discord.js";

export interface BotCommand extends ChatInputApplicationCommandData {
  execute(interaction: CommandInteraction<CacheType>): any;
}
