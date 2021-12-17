import Commands from "../commands";
import ytdlCore from "ytdl-core";
import ytSearch from "yt-search";
import { Song } from "../Types/Song";

export function GetCommandIfExist(commandName: string) {
  var c = Commands.find((x) => x.name == commandName);
  if (c) return c;

  return null;
}

export async function FindSong(text: string) {
  if (!text) return null;

  if (ytdlCore.validateURL(text)) {
    const s = await ytdlCore.getInfo(text);

    return new Song(s.videoDetails.title, s.videoDetails.video_url);
  }

  const results = await ytSearch(text);
  if (results.videos.length == 0) return null;

  return new Song(results.videos[0].title, results.videos[0].url);
}
