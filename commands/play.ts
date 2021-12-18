import DiscordJS, { Snowflake } from "discord.js";
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
    console.info(`** ${commandName} Executed`);
    const searchText = options.getString("text") || "";

    interaction.followUp(`Searching for ${searchText}`);

    var member = await interaction.guild?.members.fetch({ user, force: true });
    let subscription = SubscriptionStorage.get(interaction.guildId);
    // console.log(member, member?.voice);
    // if (!member?.voice.channel) {
    //   interaction.reply({
    //     content: "You should be in voice channel to use voice related actions.",
    //   });

    //   return;
    // }

    // var song = await FindSong(searchText);
    // if (!song) {
    //   interaction.followUp("Could not find the song you looking for.");

    //   return;
    // }

    if (!subscription) {
      const connection = joinVoiceChannel({
        channelId: "918589401590808651",
        guildId: interaction.guildId,
        adapterCreator: interaction.guild?.voiceAdapterCreator,
      });

      const musicConnection = new MusicConnection(connection);
      SubscriptionStorage.set(interaction.guildId, musicConnection);
      subscription = musicConnection;
    }

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
