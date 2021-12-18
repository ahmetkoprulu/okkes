import { AudioResource } from "@discordjs/voice";
import ytdlCore from "ytdl-core";
import { FindSong } from "../functions/helper";
const { createAudioResource, demuxProbe } = require("@discordjs/voice");

export class SongData {
  url: string;
  title: string;

  constructor(title: string, url: string) {
    this.title = title;
    this.url = url;
  }
}

export class Song extends SongData {
  public readonly onStart: () => void;
  public readonly onFinish: () => void;
  public readonly onError: (error: Error) => void;

  constructor(
    title: string,
    url: string,
    onStart: { (): void },
    onFinish: { (): void },
    onError: { (error: Error): void }
  ) {
    super(title, url);
    this.onStart = onStart;
    this.onFinish = onFinish;
    this.onError = onError;
  }

  public async createAudioResource(): Promise<AudioResource<Song>> {
    const s = ytdlCore(this.url, { filter: "audioonly" });

    const { stream, type } = await demuxProbe(s);
    return createAudioResource(stream, { metadata: this, inputType: type });
  }

  public static async from(
    searchText: string,
    methods: Pick<Song, "onStart" | "onFinish" | "onError">
  ): Promise<Song | null> {
    var song = await FindSong(searchText);
    if (!song) return null;

    let onStart = () => {
      onStart = () => {};
      methods.onStart();
    };
    let onFinish = () => {
      onFinish = () => {};
      methods.onFinish();
    };
    let onError = (error: Error) => {
      onError = () => {};
      methods.onError(error);
    };

    return new Song(song.title, song.url, onStart, onFinish, onError);
  }
}
