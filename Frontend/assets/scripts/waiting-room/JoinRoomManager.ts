import { _decorator, Component, director, EditBox, Node } from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import { UI } from "./UI";
import { Code } from "../utils/Code";
import { RoomAndPlayer } from "../entity/RoomAndPlayer";
import { SceneName } from "../utils/SceneName";
const { ccclass, property } = _decorator;

@ccclass("JoinRoomManager")
export class JoinRoomManager extends Component {
  @property(EditBox)
  private nameEditBox: EditBox = null;

  @property(UI)
  private ui: UI = null;

  private socketManager = SocketManager.getInstance();

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

  reieveResponseJoinRoom(code: number, data: RoomAndPlayer | string) {
    if (code == Code.SUCCESS) {
     director.loadScene(SceneName.ROOM);
    } else {
      if (typeof data === "string") {
        this.ui.assignMessagePanel(data);
      }
    }
  }

  protected onDisable(): void {
    this.nameEditBox.string = "";
  }
}
