import { Socket } from "socket.io-client";

export class SocketManager {
  private static _instance: SocketManager;

  private socket: Socket | null = null;

  private constructor() {
    this.initSocket();
  }

  public static getInstance(): SocketManager {
    if (!this._instance) {
      this._instance = new SocketManager();
    }
    return this._instance;
  }

  private initSocket() {
    if (this.socket) return;

    this.socket = (window as any).io("http://localhost:3000");

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });
  }

  public emit(event: string, data: any, callback?: (...args: any[]) => void) {
    this.socket?.emit(event, data, callback);
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }
}
