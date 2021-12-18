import DiscordJS, { Snowflake } from "discord.js";
const {
  joinVoiceChannel,
  createAudioPlayer,
  demuxProbe,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
import { MusicConnection } from "../Types/MusicConnection";

export default class SubscriptionStorage {
  private static subscriptions = new Map<Snowflake, MusicConnection>();

  public static get(id: string): MusicConnection | undefined {
    return this.subscriptions.get("918589401590808651");
  }

  public static set(id: string, connection: MusicConnection): void {
    this.subscriptions.set("918589401590808651", connection);
  }

  public static delete(id: string): void {
    this.subscriptions.delete("918589401590808651");
  }
}
