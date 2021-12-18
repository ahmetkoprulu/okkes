import DiscordJS, { GuildMember } from "discord.js";
const { joinVoiceChannel } = require("@discordjs/voice");
import { BotCommand } from "../Types/BotCommand";
import { MusicConnection } from "../Types/MusicConnection";
import { Song } from "../Types/Song";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export default {
  name: "play",
  description: "Plays the song from Youtube.",
  options: [
    {
      name: "text",
      description: "Name or Url of the song.",
      required: true,
      type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
    },
  ],
  async execute(interaction) {
    await interaction.deferReply();
    const { commandName, user, options } = interaction;
    const searchText = options.getString("text") || "";
    let subscription = SubscriptionStorage.get(interaction.guildId);

    if (!subscription) {
      const member = interaction.member as GuildMember;
      if (!isUserInChannel(member)) {
        interaction.followUp("Join a voice channel to summon ökkeş!");

        return;
      }
      const connection = joinVoiceChannel({
        channelId: member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild?.voiceAdapterCreator,
      });

      const musicConnection = new MusicConnection(connection);
      SubscriptionStorage.set(interaction.guildId, musicConnection);
      subscription = musicConnection;
    }

    interaction.followUp(`Searching for ${searchText}`);

    const song = await Song.from(searchText, {
      onStart() {
        interaction
          .followUp({ content: `Now playing ! **${song?.title}**` })
          .catch(console.warn);
      },
      onFinish() {
        // interaction.followUp({ content: "Now finished!" }).catch(console.warn);
      },
      onError(error) {
        console.warn(error);
        interaction
          .followUp({ content: `Error: ${error.message}` })
          .catch(console.warn);
      },
    });

    if (song == null) {
      interaction.followUp("Could not find the song you looking for.");

      return;
    }

    subscription.enqueue(song);
    await interaction.followUp(`Enqueued **${song.title}**`);
  },
} as BotCommand;

function isUserInChannel(member: GuildMember) {
  return member instanceof GuildMember && member.voice.channel;
}
