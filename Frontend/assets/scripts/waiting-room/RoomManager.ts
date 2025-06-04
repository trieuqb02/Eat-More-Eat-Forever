import { _decorator, Component, Node } from "cc";
import { UI } from "./UI";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import EventType from "../utils/EventType";
import { MyEvent } from "../entity/MyEvent";
import { Code } from "../utils/Code";
const { ccclass, property } = _decorator;

@ccclass("RoomManager")
export class RoomManager extends Component {
  @property(UI)
  private ui: UI;

  private socketMamager: SocketManager = SocketManager.getInstance();

  protected onLoad(): void {
    this.socketMamager.emit(EventName.GET_ALL_ROOM, "get all room", this.renderUI.bind(this));
    this.socketMamager.on(EventName.NEW_ROOM, this.addRoomItem.bind(this));
    this.socketMamager.on(EventName.UPDATE_ROOM,this.updateRoomItem.bind(this));
    this.socketMamager.on(EventName.REMOVE_ROOM,this.removeRoomItem.bind(this))

    this.node.on(EventType.EVENT_CLICK_SELECT_ROOM, (event: MyEvent) => {
      this.ui.heighlightRoom(event.detail);
      localStorage.setItem(EventName.SELECTED_ROOM, event.detail);
      event.propagationStopped = true;
    });
  }

  start() {}

  renderUI(code: number, data: RoomItem[]): void {
    if (code == Code.SUCCESS) {
      data.forEach((element) => {
        this.ui.addRoomItem(element);
      });
    }
  }

  addRoomItem(data: RoomItem): void {
    this.ui.addRoomItem(data);
  }

  updateRoomItem(data: RoomItem): void {
    this.ui.updateRoom(data);
  }

  removeRoomItem(data: RoomItem): void {
    this.ui.deleteRoom(data.id);
  }
}
