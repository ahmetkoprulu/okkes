import { AudioResource } from "@discordjs/voice";
import { raw as YoutubeDl } from "youtube-dl-exec";
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
    return new Promise((resolve, reject) => {
      const process = YoutubeDl(
        this.url,
        {
          output: "-",
          format: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
        },
        { stdio: ["ignore", "pipe", "ignore"] }
      );

      if (!process.stdout) {
        reject(new Error("No stdout"));
        return;
      }
      const stream = process.stdout;
      const onError = (error: Error) => {
        if (!process.killed) process.kill();
        stream.resume();
        reject(error);
      };
      process
        .once("spawn", () => {
          demuxProbe(stream)
            .then((probe: { stream: any; type: any }) =>
              resolve(
                createAudioResource(probe.stream, {
                  metadata: this,
                  inputType: probe.type,
                })
              )
            )
            .catch(onError);
        })
        .catch(onError);
    });
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
