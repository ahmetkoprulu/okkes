import DiscordJS from "discord.js";
import { BotCommand } from "../Types/BotCommand";

export default {
  name: "ping",
  description: "Replies with pong.",
  execute(interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>) {
    const { commandName, user, options } = interaction;

    interaction.reply({
      content: "pong",
    });
  },
} as BotCommand;
