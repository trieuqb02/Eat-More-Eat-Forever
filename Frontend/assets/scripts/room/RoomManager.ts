import { _decorator, Component, director, Node } from "cc";
import { DataManager } from "../DataManager";
import { UIRoom } from "./UIRoom";
import { SocketManager } from "../socket/SocketManager";
import { EventName } from "../utils/EventName";
import { Player } from "../entity/Player";
import { Code } from "../utils/Code";
import { SceneName } from "../utils/SceneName";
const { ccclass, property } = _decorator;

@ccclass("RoomManager")
export class RoomManager extends Component {
  @property(UIRoom)
  private ui: UIRoom = null;

  private dataManager: DataManager = DataManager.getInstance();

  private socketManager: SocketManager = SocketManager.getInstance();

  private onJoinRoom = this.playerJoinRoom.bind(this);
  private onLeaveRoom = this.playerLeaveRoom.bind(this);
  private onDissolveRoom = this.dissolveRoom.bind(this);
  private onStartedGame = this.startedGame.bind(this);
  private onChangeReady = this.changeReady.bind(this);

  protected onLoad(): void {
    this.renderPlayersInRoom();
    this.socketManager.on(EventName.PLAYER_JOINED, this.onJoinRoom);
    this.socketManager.on(EventName.LEAVED_ROOM, this.onLeaveRoom);
    this.socketManager.on(EventName.DISSOLVE_ROOM, this.onDissolveRoom);
    this.socketManager.on(EventName.STARTED_GAME, this.onStartedGame);
    this.socketManager.on(EventName.CHANGE_READY, this.onChangeReady);
  }

  renderPlayersInRoom(): void {
    const player = this.dataManager.getRoomAndPlayer().player;
    if (player.isHost) {
      this.ui.addPlayer(player);
    } else {
      const arr = this.dataManager.getPlayersInRoom();
      arr.forEach((player) => {
        this.ui.addPlayer(player);
      });
    }
  }

  playerJoinRoom(player: Player): void {
    const arr = this.dataManager.getPlayersInRoom();
    arr.push(player);
    this.dataManager.setPlayersInRoom(arr);
    this.ui.addPlayer(player);
  }

  playerLeaveRoom(player: Player): void {
    let arr = this.dataManager.getPlayersInRoom();

    arr = arr.filter((ele) => ele.id != player.id);

    this.dataManager.setPlayersInRoom(arr);

    this.ui.removePlayer(player);
  }

  dissolveRoom(message: string): void {
    this.dataManager.clear();
    director.preloadScene(SceneName.WAITING_ROOM, () => {
      director.loadScene(SceneName.WAITING_ROOM);
    });
  }

  changeReady(player: Player) {
    this.ui.updatePlayer(player);
  }

  onClickCancelOrReadyOrStart() {
    const roomAndPlayer = this.dataManager.getRoomAndPlayer();

    this.socketManager.emit(
      EventName.START_GAME,
      {
        roomId: roomAndPlayer.room.id,
        playerId: roomAndPlayer.player.id,
        isHost: roomAndPlayer.player.isHost,
      },
      this.startGame.bind(this)
    );
  }

  onClickLeaveRoom() {
    const roomAndPlayer = this.dataManager.getRoomAndPlayer();
    this.socketManager.emit(
      EventName.LEAVE_ROOM,
      {
        roomId: roomAndPlayer.room.id,
        playerId: roomAndPlayer.player.id,
      },
      this.leaveRoom.bind(this)
    );
  }

  startedGame(start: boolean) {
    if (start) {
      if (this.dataManager.getRoomAndPlayer().player.isHost)
        this.socketManager.emit("START_GAMEPLAY", {
          roomId: this.dataManager.getRoomAndPlayer().room.id,
        });
      director.loadScene(SceneName.MAIN001);
    }
  }

  startGame(code: number, message: string, player: Player) {
    if (code == Code.SUCCESS) {
      this.ui.updatePlayer(player);
    }
  }

  leaveRoom(code: number, message: string, player: Player) {
    if (code == Code.SUCCESS) {
      director.preloadScene(SceneName.WAITING_ROOM, () => {
        director.loadScene(SceneName.WAITING_ROOM);
      });
    }
  }

  protected onDestroy(): void {
    this.socketManager.off(EventName.PLAYER_JOINED, this.onJoinRoom);
    this.socketManager.off(EventName.LEAVED_ROOM, this.onLeaveRoom);
    this.socketManager.off(EventName.DISSOLVE_ROOM, this.onDissolveRoom);
    this.socketManager.off(EventName.STARTED_GAME, this.onStartedGame);
    this.socketManager.off(EventName.CHANGE_READY, this.onChangeReady);
  }
}
