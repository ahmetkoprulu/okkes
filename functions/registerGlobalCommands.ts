import { REST } from "@discordjs/rest";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";
import CommandsTemplates from "../commands";
import DotEnv from "dotenv";

DotEnv.config();

export async function registerGlobalCommands() {
  const commands: any[] = [];

  CommandsTemplates.forEach((command) => {
    var c: any;
    c = new SlashCommandBuilder()
      .setName(command.name)
      .setDescription(command.description);

    command.options?.forEach((x) => {
      c = c.addStringOption((option: any) =>
        option.setName(x.name).setDescription(x.description).setRequired(true)
      );
    });
    commands.push(c.toJSON());
  });

  console.info(commands);

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN || "");

  console.log("Started refreshing application (/) commands.");
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID || ""), {
      body: commands,
    });
    console.log("Successfully reloaded application (/) commands.");
  } catch (err) {
    console.error(err);
  }
}

registerGlobalCommands();
