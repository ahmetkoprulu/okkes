import DiscordJS from "discord.js";
import { BotCommand } from "../Types/BotCommand";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "skip",
  description: "Skips to the next song in the queue",
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

    // Calling .stop() on an AudioPlayer causes it to transition into the Idle state. Because of a state transition
    // listener defined in music/subscription.ts, transitions into the Idle state mean the next track from the queue
    // will be loaded and played.
    subscription.player.stop();
    await interaction.followUp("Skipped to the next song!");
  },
} as BotCommand;
