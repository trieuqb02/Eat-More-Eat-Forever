import { _decorator, Component, instantiate, Node, Prefab } from "cc";
import { Player } from "../entity/Player";
import { PlayerInfo } from "./PlayerInfo";
import { DataManager } from "../DataManager";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import { Code } from "../utils/Code";
const { ccclass, property } = _decorator;

@ccclass("UIRoom")
export class UIRoom extends Component {
  @property(Node)
  private room: Node = null;

  @property(Prefab)
  private player: Prefab = null;

  private dataManager: DataManager = DataManager.getInstance();

  private socketManager: SocketManager = SocketManager.getInstance();

  protected onLoad(): void {
    this.socketManager.on;
  }

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

  updatePlayer() {}
}
