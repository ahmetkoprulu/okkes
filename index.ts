import DiscordJS, { Collection, GuildMember, Intents } from "discord.js";
import dotenv from "dotenv";
import { GetCommandIfExist } from "./functions/helper";

dotenv.config();

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.on("ready", async () => {
  console.log("The bot is up and running.");
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

client.login(process.env.TOKEN);
