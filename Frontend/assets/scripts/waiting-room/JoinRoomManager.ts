import { _decorator, Component, EditBox, Node } from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
const { ccclass, property } = _decorator;

@ccclass("JoinRoomManager")
export class JoinRoomManager extends Component {
  @property(EditBox)
  private nameEditBox: EditBox = null;

  private socketManager =  SocketManager.getInstance();

  private onComfirm(): void {
    if (!this.nameEditBox.string) return;
    const roomId = localStorage.getItem(EventName.SELECTED_ROOM);
    this.socketManager.emit(EventName.JOIN_ROOM,{
      id : roomId,
      name: this.nameEditBox.string
    });

    this.node.active = false;
  }
}
