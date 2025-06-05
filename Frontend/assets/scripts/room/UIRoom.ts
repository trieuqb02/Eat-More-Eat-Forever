import { _decorator, Button, Component, HorizontalTextAlignment, instantiate, Label, Node, Prefab, ScrollView } from "cc";
import { Player } from "../entity/Player";
import { PlayerInfo } from "./PlayerInfo";
import { SocketManager } from "../socket/SocketManager";
const { ccclass, property } = _decorator;

@ccclass("UIRoom")
export class UIRoom extends Component {
  @property(Node)
  private room: Node = null;

  @property(Prefab)
  private player: Prefab = null;

  @property(ScrollView)
  private chatList: ScrollView = null;

  @property(Prefab)
  private chatItem: Prefab = null;

  addPlayer(player: Player) {
    const playerNode = instantiate(this.player);

    playerNode.getComponent(PlayerInfo).init(player);

    this.room.addChild(playerNode);
  }

  removePlayer(player: Player) {
    const nodeArr = this.room.children;

    const node = nodeArr.find((element) => {
      const idNode = element.getComponent(PlayerInfo).getId();
      return idNode == player.id;
    });

    this.room.removeChild(node);
  }

  updatePlayer(player: Player) {
    const nodeArr = this.room.children;

    const node = nodeArr.find((element) => {
      const idNode = element.getComponent(PlayerInfo).getId();
      return idNode == player.id;
    });

    node.getComponent(PlayerInfo).changeReady(player.isReady);
  }

  renderMessage(name: string, message: string, position: string){
    const chatItem = instantiate(this.chatItem);

    let pos;
    if(position == "L"){
      pos = HorizontalTextAlignment.LEFT;
    } else {
      pos = HorizontalTextAlignment.RIGHT
    }
    const label = chatItem.getComponent(Label)
    label.horizontalAlign = pos;
    label.string = message;
    this.chatList.content.addChild(chatItem);
  }



}
