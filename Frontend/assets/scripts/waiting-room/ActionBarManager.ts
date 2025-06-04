import { _decorator, Component, Node } from "cc";
import { UI } from "./UI";
import { EventName } from "../utils/EventName";
const { ccclass, property } = _decorator;

@ccclass("ActionBarManager")
export class ActionBarManager extends Component {
  @property(UI)
  ui: UI = null;

  start() {}

  update(deltaTime: number) {}

  onClickCreateRoomPanel() {
    this.ui.showAndHideCreateRoomPanel();
  }

  onClickFastJoin() {
    // handle fast join
  }

  onClickJoinRoom() {
    const roomId = localStorage.getItem(EventName.SELECTED_ROOM);
    if (!roomId) return;
    this.ui.showAndHideJoinRoomPanel();
  }
}
