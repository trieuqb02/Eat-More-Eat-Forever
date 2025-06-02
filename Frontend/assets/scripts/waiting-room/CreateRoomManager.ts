import { _decorator, Button, Component, EditBox, Label, Node } from "cc";
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
    console.log(this.nameEditBox.string, this.quantity);
  }

  protected onDisable(): void {
    this.quantity = 0;
    this.nameEditBox.string = "";
  }
}
