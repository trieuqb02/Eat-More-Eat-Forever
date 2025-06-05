import { _decorator, Component, director, EditBox, Node } from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import { UI } from "./UI";
import { Code } from "../utils/Code";
import { RoomAndPlayer } from "../entity/RoomAndPlayer";
import { SceneName } from "../utils/SceneName";
import { DataManager } from "../DataManager";
import { Player } from "../entity/Player";
const { ccclass, property } = _decorator;

@ccclass("JoinRoomManager")
export class JoinRoomManager extends Component {
  @property(EditBox)
  private nameEditBox: EditBox = null;

  @property(UI)
  private ui: UI = null;

  private socketManager = SocketManager.getInstance();

  private dataManager = DataManager.getInstance();

  private onComfirm(): void {
    if (!this.nameEditBox.string) return;
    const roomId = localStorage.getItem(EventName.SELECTED_ROOM);
    this.socketManager.emit(
      EventName.JOIN_ROOM,
      {
        id: roomId,
        name: this.nameEditBox.string,
      },
      this.reieveResponseJoinRoom.bind(this)
    );

    this.node.active = false;
  }

  reieveResponseJoinRoom(code: number, message: string, roomAndPlayer: RoomAndPlayer, playes: Player[]) {
    if (code == Code.SUCCESS) {
      this.dataManager.setRoomAndPlayer(roomAndPlayer);
      this.dataManager.setPlayersInRoom(playes);
      director.loadScene(SceneName.ROOM);
    } else {
      this.ui.assignMessagePanel(message);
    }
  }

  protected onDisable(): void {
    this.nameEditBox.string = "";
  }
}
