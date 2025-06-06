import { _decorator, Component, find, instantiate, Node, Prefab, ScrollView } from "cc";
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
  private ui: UI = null;

  private socketManager: SocketManager = SocketManager.getInstance();

  protected onLoad(): void {
    this.socketManager.emit(EventName.GET_ALL_ROOM,"get all room",this.renderUI.bind(this));

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

  refreshWaitingRoom(){
    this.socketManager.emit(EventName.GET_ALL_ROOM,"get all room",this.renderUI.bind(this));
  }
}
