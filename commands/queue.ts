import DiscordJS from "discord.js";
import { AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { BotCommand } from "../Types/BotCommand";
import { Song } from "../Types/Song";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "queue",
  description: "Displays the music queue",
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

    const current =
      subscription.player.state.status === AudioPlayerStatus.Idle
        ? `Nothing is currently playing!`
        : `Playing **${
            (subscription.player.state.resource as AudioResource<Song>).metadata
              .title
          }**`;

    const queue = subscription.queue
      .slice(0, 5)
      .map((track, index) => `${index + 1}) ${track.title}`)
      .join("\n");

    await interaction.editReply(`${current}\n\n${queue}`);
  },
} as BotCommand;
