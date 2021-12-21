import DiscordJS from "discord.js";
import { BotCommand } from "../Types/BotCommand";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "loop",
  description: "Loops the current song.",
  async execute(
    interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>
  ) {
    const { commandName, user, options } = interaction;
    await interaction.deferReply();

    const subscription = SubscriptionStorage.get(interaction.guildId);
    if (!subscription) {
      await interaction.followUp({
        content: "Ökkeş is not playing any song.",
        ephemeral: true,
      });

      return;
    }

    subscription.isLoop = !subscription.isLoop;
    if (subscription.isLoop)
      await interaction.followUp({
        content: `Loop mode activated`,
        ephemeral: true,
      });
    else
      await interaction.followUp({
        content: `Loop mode deactivated`,
        ephemeral: true,
      });
  },
} as BotCommand;
