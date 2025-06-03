import { _decorator, Button, Component, EditBox, Label, Node } from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
const { ccclass, property } = _decorator;

@ccclass("CreateRommManager")
export class CreateRommManager extends Component {
  @property(EditBox)
  private nameEditBox: EditBox = null;

  @property(Label)
  private quantityLabel: Label = null;

  @property
  private maxiumPlayer: number = 0;

  @property
  private defaultQuantity: number = 0;

  private quantity: number = 0;

  private socketManager =  SocketManager.getInstance();

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
    this.socketManager.emit(EventName.CREATE_ROOM, {
      name: this.nameEditBox.string,
      quantity: this.quantity,
    });

    this.socketManager.on(EventName.CREATED_ROOM, this.createdRoom.bind(this));

    this.node.active = false;
  }

  createdRoom(data:RoomItem){
    this.socketManager.emit(EventName.JOIN_ROOM, {
      id: data.id,
      name: data.name,
    })
  }

  protected onDisable(): void {
    this.quantity = this.defaultQuantity;
    this.nameEditBox.string = "";
  }
}
