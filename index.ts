import DiscordJS, { GuildMember, Intents } from "discord.js";
import dotenv from "dotenv";
import CommandsTemplates from "./commands";
import { GetCommandIfExist } from "./functions/helper";

dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// import fs from "fs";
// const commandTemplates = fs
//   .readdirSync("./commands/")
//   .filter((x) => x.endsWith(".js"))
//   .forEach((x) => {
//     const command = require(`./commands/${x}`);
//     commands.set(command.name, command);
//   });

client.on("ready", () => {
  console.log("The bot is up and running.");

  const GuildId = process.env.GUILD_ID || "";
  const guild = client.guilds.cache.get(GuildId);
  let commands = guild?.commands;

  CommandsTemplates.forEach((x) => commands?.create(x));
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  var command = GetCommandIfExist(commandName);
  if (!command) {
    interaction.reply({
      content: "No such command exist.",
    });

    return;
  }

  await command.execute(interaction);
});

// client.on("messageCreate", (message) => {
//   console.log(message);
//   if (message.content == "ping") {
//     message.reply({
//       content: "pong",
//     });
//   }
// });

client.login(process.env.TOKEN);

function isInVoiceChannel(member: GuildMember) {}
