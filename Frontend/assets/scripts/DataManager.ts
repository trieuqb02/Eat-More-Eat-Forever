import { Player } from "./entity/Player";
import { RoomAndPlayer } from "./entity/RoomAndPlayer";

export class DataManager {
  private static _instance: DataManager;

  private roomAndPlayer: RoomAndPlayer | null = null;

  private players: Player[] = [];

  public static getInstance(): DataManager {
    if (!this._instance) {
      this._instance = new DataManager();
    }
    return this._instance;
  }

  setRoomAndPlayer(data: RoomAndPlayer): void{
    this.roomAndPlayer = data;
  }

  getRoomAndPlayer(): RoomAndPlayer{
    return this.roomAndPlayer;
  }

  setPlayersInRoom(players: Player[]){
    this.players = players;
  }

  getPlayersInRoom(){
    return this.players;
  }

  clear(){
    this.players = [];
    this.roomAndPlayer = null;
  }

}
