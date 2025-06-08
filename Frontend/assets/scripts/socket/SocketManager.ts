import { Socket } from "socket.io-client";
import { DataManager } from "../DataManager";
import { EventName } from "../utils/EventName";

export class SocketManager {
  private static _instance: SocketManager;

  private socket: Socket | null = null;

  public static getInstance(): SocketManager {
    if (!this._instance) {
      this._instance = new SocketManager();
    }
    return this._instance;
  }

  public initSocket() {
    if (this.socket) return;

    this.socket = (window as any).io("http://localhost:3000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    let hasConnectedBefore = false;
    this.socket.on("connect", () => {
      if (hasConnectedBefore) {
        console.log("Reconnected", this.socket.id);
        const data = DataManager.getInstance().getRoomAndPlayer();
        if (data) {
          this.socket.emit(EventName.REJOIN_GAME, {
            playerId: data.player.id,
            roomId: data.room.id,
            isHost: data.player.isHost
          });
        } else {
          console.log("No data")
        }
      } else {
        console.log("Connected: ", this.socket.id);
        hasConnectedBefore = true;
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Lost connection:", reason);
      // hiện pop up
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected");
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
