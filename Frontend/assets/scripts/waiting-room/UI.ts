import {
  _decorator,
  Component,
  director,
  instantiate,
  Label,
  Node,
  Prefab,
  ScrollView,
} from "cc";
import { Room } from "./Room";
import { MessageManager } from "./MessageManager";
import { WaitingRoomManager } from "./WaitingRoomManager";
import { SceneName } from "../utils/SceneName";
const { ccclass, property } = _decorator;

@ccclass("UI")
export class UI extends Component {
  @property(Node)
  private createRoomPanel: Node = null;

  @property(Node)
  private messagePanel: Node = null;

  @property(Node)
  private joinRoomPanel: Node = null;

  @property(ScrollView)
  private listRoom: ScrollView = null;

  @property(Prefab)
  private roomItemPrefab: Prefab = null;

  public addRoomItem(roomItem: RoomItem): void {
    const room = instantiate(this.roomItemPrefab);

    room.getComponent(Room).init(roomItem);

    this.listRoom.content.addChild(room);
  }

  public heighlightRoom(id: string) {
    const arr = this.listRoom.content.children;
    arr.forEach((element) => {
      const roomId = element.getComponent(Room).getId();
      element.getComponent(Room).setSelected(id == roomId);
    });
  }

  public showAndHideCreateRoomPanel() {
    this.createRoomPanel.active = !this.createRoomPanel.active;
  }

  public showAndHideJoinRoomPanel() {
    this.joinRoomPanel.active = !this.joinRoomPanel.active;
  }

  public showAndHideMessagePanel() {
    this.messagePanel.active = !this.messagePanel.active;
  }

  public assignMessagePanel(message: string) {
    this.messagePanel.active = true;
    this.messagePanel.getComponent(MessageManager).showMessage(message);
  }

  public refreshWaitingRoom(){
    this.listRoom.content.removeAllChildren();
    this.listRoom.getComponent(WaitingRoomManager).refreshWaitingRoom();
  }

  public clickBack(){
    director.loadScene(SceneName.MENU)
  }
}
