import { Socket } from "socket.io-client";

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

    this.socket = (window as any).io("http://172.16.1.29:3000",{
      reconnection: true,          
      reconnectionAttempts: 5,     
      reconnectionDelay: 1000,     
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
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

  public off(event: string, callback: (...args: any[]) => void){
    this.socket?.off(event, callback);
  }
}
