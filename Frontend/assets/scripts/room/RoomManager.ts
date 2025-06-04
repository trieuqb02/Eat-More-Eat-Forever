import { _decorator, Component, Node } from 'cc';
import { DataManager } from '../DataManager';
import { UIRoom } from './UIRoom';
import { SocketManager } from '../socket/SocketManager';
import { EventName } from '../utils/EventName';
import { Player } from '../entity/Player';
import { Code } from '../utils/Code';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {

    @property(UIRoom)
    private ui: UIRoom = null;

    private dataManager: DataManager = DataManager.getInstance();

    private socketManager: SocketManager = SocketManager.getInstance();

    protected onLoad(): void {
        this.renderPlayersInRoom();

        this.socketManager.on(EventName.PLAYER_JOINED, this.playerJoinRoom.bind(this));
    }

    renderPlayersInRoom(): void{
        const player = this.dataManager.getRoomAndPlayer().player;
        if(player.isHost){
            this.ui.addPlayer(player);
        } else {
            const arr = this.dataManager.getPlayersInRoom();
            arr.forEach(player => {
                this.ui.addPlayer(player);
            })
        }
    }

    playerJoinRoom(player: Player): void {
        this.ui.addPlayer(player);
    }


    onClickReadyOrStart(){
        
    }

    onClickLeaveRoom(){
        const roomAndPlayer = this.dataManager.getRoomAndPlayer();
        console.log(roomAndPlayer)
        this.socketManager.emit(EventName.LEAVE_ROOM, {
            roomId: roomAndPlayer.room.id,
            playerId: roomAndPlayer.player.id
        }, this.playerLeaveRoom.bind(this))
    }

    playerLeaveRoom(code:number, message:string , player: Player){
        if(code == Code.SUCCESS){
            this.ui.removePlayer(player);
        }
    }
}

