import { _decorator, Component, find, Node } from "cc";
import { UI } from "./UI";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import EventType from "../utils/EventType";
import { MyEvent } from "../entity/MyEvent";
import { Code } from "../utils/Code";
const { ccclass, property } = _decorator;

@ccclass("WaitingRoomManager")
export class WaitingRoomManager extends Component {
  @property(UI)
  private ui: UI;

  private socketMamager: SocketManager = SocketManager.getInstance();

  protected onLoad(): void {
    console.log(">>> WaitingRoomManager onLoad called", this.ui);

    this.socketMamager.emit(EventName.GET_ALL_ROOM,"get all room",this.renderUI.bind(this));
    this.socketMamager.on(EventName.NEW_ROOM, this.addRoomItem.bind(this));
    this.socketMamager.on(EventName.UPDATE_ROOM,this.updateRoomItem.bind(this));
    this.socketMamager.on(EventName.REMOVE_ROOM,this.removeRoomItem.bind(this));

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
    console.log(this.ui);
    this.ui.addRoomItem(data);
  }

  updateRoomItem(data: RoomItem): void {
    console.log("update");
    this.ui.updateRoom(data);
  }

  removeRoomItem(data: RoomItem): void {
    console.log("remove");
    this.ui.deleteRoom(data.id);
  }
  
}
