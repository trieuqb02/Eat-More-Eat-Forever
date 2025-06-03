import {
  _decorator,
  Button,
  Component,
  director,
  EditBox,
  Label,
  Node,
} from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import { UI } from "./UI";
import { Code } from "../utils/Code";
import { RoomAndPlayer } from "../entity/RoomAndPlayer";
const { ccclass, property } = _decorator;

@ccclass("CreateRommManager")
export class CreateRommManager extends Component {
  @property(EditBox)
  private nameEditBox: EditBox = null;

  @property(Label)
  private quantityLabel: Label = null;

  @property(UI)
  private ui: UI = null;

  @property
  private maxiumPlayer: number = 0;

  @property
  private defaultQuantity: number = 0;

  private quantity: number = 0;

  private socketManager = SocketManager.getInstance();

  protected onLoad(): void {}

  protected start(): void {
    this.quantity = this.defaultQuantity;
    this.changeQuantity();
  }

  private onPlus(): void {
    if (this.quantity == this.maxiumPlayer) return;
    this.quantity += 1;
    this.changeQuantity();
  }

  private onMinus(): void {
    if (this.quantity <= this.defaultQuantity) return;
    this.quantity -= 1;
    this.changeQuantity();
  }

  private changeQuantity(): void {
    this.quantityLabel.string = `${this.quantity}`;
  }

  private onComfirm(): void {
    if (!this.nameEditBox.string) return;
    this.socketManager.emit(
      EventName.CREATE_ROOM,
      {
        name: this.nameEditBox.string,
        quantity: this.quantity,
      },
      this.reieveResponseCreateRoom.bind(this)
    );

    this.node.active = false;
  }

  reieveResponseCreateRoom(code: number, data: RoomAndPlayer | string) {
    if (code == Code.SUCCESS) {
      director.loadScene("room");
    }
  }

  protected onDisable(): void {
    this.quantity = this.defaultQuantity;
    this.nameEditBox.string = "";
  }
}
