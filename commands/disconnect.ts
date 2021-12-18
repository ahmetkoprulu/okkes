import DiscordJS from "discord.js";
import { BotCommand } from "../Types/BotCommand";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "disconnect",
  description: "Disconnects ökkeş",
  async execute(
    interaction: DiscordJS.CommandInteraction<DiscordJS.CacheType>
  ) {
    const { commandName, user, options } = interaction;
    await interaction.deferReply();

    const subscription = SubscriptionStorage.get(interaction.guildId);
    console.log(subscription);
    if (!subscription) {
      await interaction.followUp("Ökkeş is not in a channel");

      return;
    }

    subscription.connection.destroy();
    await interaction.followUp({
      content: `Ökkeş is leaving...`,
    });
  },
} as BotCommand;
