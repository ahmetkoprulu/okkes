import DiscordJS from "discord.js";
import { BotCommand } from "../Types/BotCommand";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "resume",
  description: "Resumes the music player",
  async execute(
    interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>
  ) {
    const { commandName, user, options } = interaction;
    await interaction.deferReply();

    const subscription = SubscriptionStorage.get(interaction.guildId);
    if (!subscription) {
      await interaction.followUp("Ökkeş is not in a channel");

      return;
    }
    subscription.player.unpause();
    await interaction.followUp(`Player resuming!`);
  },
} as BotCommand;
