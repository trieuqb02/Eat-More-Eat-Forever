import { _decorator, Color, Component, HorizontalTextAlignment, instantiate, Label, Layout, Node, Prefab, ScrollView, Sprite } from "cc";
import { Player } from "../entity/Player";
import { PlayerInfo } from "./PlayerInfo";
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

  renderMessage(name: string, message: string, time: string,position: string){
    const chatItem = instantiate(this.chatItem);
    const layout = chatItem.getComponent(Layout);

    let color;
    if(position == "L"){
      color = new Color(241, 240, 240);
      layout.horizontalDirection = Layout.HorizontalDirection.LEFT_TO_RIGHT
    } else {
      color = new Color(220, 248, 198);
      layout.horizontalDirection = Layout.HorizontalDirection.RIGHT_TO_LEFT
    }
    
    const messagePanel = chatItem.getChildByName("MessagePanel");
    const bg = messagePanel.getComponent(Sprite);
    const messageLB = messagePanel.getChildByName("Message").getComponent(Label);
    const timeLB = messagePanel.getChildByName("Time").getComponent(Label);
    bg.color = color;
    messageLB.string = `${name}: ${message}`;
    timeLB.string = time
    this.chatList.content.addChild(chatItem);
  }



}
