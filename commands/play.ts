import DiscordJS, { Snowflake } from "discord.js";
const {
  joinVoiceChannel,
  createAudioPlayer,
  demuxProbe,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
import ytdlCore from "ytdl-core";
import { BotCommand } from "../Types/BotCommand";
import { MusicPlayer } from "../Types/MusicPlayer";
import { Song } from "../Types/Song";
import { FindSong } from "../functions/helper";

const subscriptions = new Map<Snowflake, MusicPlayer>();

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
    let subscription = subscriptions.get(interaction.guildId);
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

    const connection = joinVoiceChannel({
      channelId: "918589401590808651",
      guildId: interaction.guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator,
    });

    const musicPlayer = new MusicPlayer(connection);
    subscriptions.set(interaction.guildId, musicPlayer);
    subscription = musicPlayer;

    console.log(connection.voiceConnection);

    const song = await Song.from(searchText, {
      onStart() {
        interaction
          .followUp({ content: `Now playing ! ${song?.title}` })
          .catch(console.warn);
      },
      onFinish() {
        interaction.followUp({ content: "Now finished!" }).catch(console.warn);
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
