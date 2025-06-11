import { Socket } from "socket.io-client";
import { DataManager } from "../DataManager";
import { EventName } from "../utils/EventName";
import GlobalEventBus from "../GlobalEventBus";
import { SceneName } from "../utils/SceneName";
import { director } from "cc";

export class SocketManager {
  private static _instance: SocketManager;

  private socket: Socket | null = null;

  private urlSocket: string = "http://localhost:3000";

  public static getInstance(): SocketManager {
    if (!this._instance) {
      this._instance = new SocketManager();
    }
    return this._instance;
  }

  public initSocket() {
    if (this.socket) return;

    this.socket = (window as any).io(this.urlSocket, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    let hasConnectedBefore = false;
    this.socket.on(EventName.CONNECT, () => {
      
      if (hasConnectedBefore) {
        console.log("Reconnected", this.socket.id);
        GlobalEventBus.emit(EventName.RECONNECT_NETWORK);
        const data = DataManager.getInstance().getRoomAndPlayer();
        if (data) {
          this.socket.emit(EventName.REJOIN_GAME, {
            playerId: data.player.id,
            roomId: data.room.id,
            isHost: data.player.isHost,
          });
        } else {
          console.log("No data");
        }
      } else {
        console.log("Connected: ", this.socket.id);
        hasConnectedBefore = true;
      }
    });

    this.socket.on(EventName.DISCONECT, (reason) => {
      console.log("Lost connection:", reason);

      GlobalEventBus.emit(EventName.DISCONNECT_NETWORK);
    });

    this.socket.on(EventName.TIMEOUT_CONNECTION, () => {
      const data = DataManager.getInstance().getRoomAndPlayer();
      this.socket.emit(EventName.PLAYER_QUIT, {
          playerId: data.player.id,
          roomId: data.room.id
      });
      director.loadScene(SceneName.WAITING_ROOM)
  });
  }
  
  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public emit(event: string, data: any, callback?: (...args: any[]) => void) {
    this.socket?.emit(event, data, callback);
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  public off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}
