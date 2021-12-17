import DiscordJS from "discord.js";
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
} = require("@discordjs/voice");
import ytdlCore from "ytdl-core";
import { BotCommand } from "../Types/BotCommand";
import { FindSong } from "../functions/helper";

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
    const { commandName, user, options } = interaction;

    const searchText = options.getString("text") || "";
    console.log(searchText);

    var member = await interaction.guild?.members.fetch({ user, force: true });

    // console.log(member, member?.voice);
    // if (!member?.voice.channel) {
    //   interaction.reply({
    //     content: "You should be in voice channel to use voice related actions.",
    //   });

    //   return;
    // }

    var song = await FindSong(searchText);
    if (!song) {
      interaction.reply({
        content: "Could not find the song you looking for.",
      });

      return;
    }

    console.log(song);
    const connection = joinVoiceChannel({
      channelId: "918589401590808651",
      guildId: interaction.guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    // Play "track.mp3" across two voice connections
    connection.subscribe(player);
    //TODO: Check if the string in url format.

    // interaction.deferReply({
    //   ephemeral: true,
    // });

    const s = ytdlCore(song.url, { filter: "audioonly" });
    const { stream, type } = await demuxProbe(s);
    console.log(type);
    player.play(createAudioResource(stream, { inputType: type }));
    interaction.reply({
      content: "get request",
    });
  },
} as BotCommand;
