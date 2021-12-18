import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
  AudioPlayerPlayingState,
  AudioPlayerError,
  AudioPlayerState,
  AudioPlayerIdleState,
} from "@discordjs/voice";
import type { Song } from "./Song";
import { promisify } from "node:util";
import SubscriptionStorage from "../functions/SubscriptionStorage";

export class MusicConnection {
  public readonly connection: VoiceConnection;
  public readonly player: AudioPlayer;
  public queue: Song[];
  public queueLock = false;
  public readyLock = false;

  constructor(voiceConnection: VoiceConnection) {
    this.connection = voiceConnection;
    this.player = createAudioPlayer();
    this.queue = [];

    this.listenConnectionStateChanges();
    this.listenPlayerStateChanges();

    voiceConnection.subscribe(this.player);
  }

  public enqueue(song: Song) {
    this.queue.push(song);
    void this.processQueue();
  }

  public stop() {
    this.queueLock = true;
    this.queue = [];
    this.player.stop(true);
    SubscriptionStorage.delete(this.connection.joinConfig.guildId);
  }

  private async processQueue(): Promise<void> {
    if (
      this.queueLock ||
      this.player.state.status !== AudioPlayerStatus.Idle ||
      this.queue.length === 0
    ) {
      return;
    }

    this.queueLock = true;

    const nextTrack = this.queue.shift()!;
    try {
      const resource = await nextTrack.createAudioResource();
      this.player.play(resource);
      this.queueLock = false;
    } catch (error) {
      nextTrack.onError(error as Error);
      this.queueLock = false;
      return this.processQueue();
    }
  }

  private listenConnectionStateChanges(): any {
    this.connection.on(
      VoiceConnectionStatus.Disconnected,
      async (_, newState) => {
        if (!this.isDisconnectedIntentionaly(newState)) {
          this.connection.destroy();

          return;
        }

        entersState(
          this.connection,
          VoiceConnectionStatus.Connecting,
          5_000
        ).catch(() => this.connection.destroy());
      }
    );

    this.connection.on(VoiceConnectionStatus.Destroyed, async () =>
      this.stop()
    );

    /**
     * In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
     * before destroying the voice connection. This stops the voice connection permanently existing in one of these
     * states.
     */
    this.connection.on(VoiceConnectionStatus.Connecting, async () => {
      if (this.readyLock) return;

      this.readyLock = true;
      entersState(this.connection, VoiceConnectionStatus.Ready, 20_000)
        .then(() => {
          this.readyLock = false;
        })
        .catch(() => {
          if (this.connection.state.status !== VoiceConnectionStatus.Destroyed)
            this.connection.destroy();
          this.readyLock = false;
        });
    });
  }

  private listenPlayerStateChanges(): any {
    this.player.on(
      AudioPlayerStatus.Idle,
      (oldState: AudioPlayerState, newState: AudioPlayerIdleState) => {
        // If the Playing state has been entered, then a new track has started playback.
        let o = oldState as { state?: string; resource?: any };
        if (!o.resource) return;

        (o.resource as AudioResource<Song>).metadata.onFinish();
        void this.processQueue();
      }
    );

    this.player.on(
      AudioPlayerStatus.Playing,
      (_, newState: AudioPlayerPlayingState) => {
        // If the Playing state has been entered, then a new track has started playback.
        (newState.resource as AudioResource<Song>).metadata.onStart();
      }
    );

    this.player.on("error", (error: AudioPlayerError) =>
      (error.resource as AudioResource<Song>).metadata.onError(error)
    );
  }

  private isDisconnectedIntentionaly(state: any): boolean {
    /**
     * If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
     * but there is a chance the connection will recover itself if the reason of the disconnect was due to
     * switching voice channels. This is also the same code for the bot being kicked from the voice channel,
     * so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
     * the voice connection.
     */

    return (
      state.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
      state.closeCode === 4014
    );
  }
}
