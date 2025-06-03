import { _decorator, Component, Label, Node, UI } from "cc";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
const { ccclass, property } = _decorator;

@ccclass("MessageManager")
export class MessageManager extends Component {
  @property(Label)
  private messageLabel: Label = null;

  showMessage(message: string) {
    this.messageLabel.string = message;
    this.node.active = true;
  }

  onClickCloseMessage() {
    this.node.active = false;
  }
}
