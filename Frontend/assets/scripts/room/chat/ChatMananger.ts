import { _decorator, Component, EditBox, Node, UI } from 'cc';
import { SocketManager } from '../../socket/SocketManager';
import { EventName } from '../../utils/EventName';
import { DataManager } from '../../DataManager';
import { UIRoom } from '../UIRoom';
import { Player } from '../../entity/Player';
const { ccclass, property } = _decorator;

@ccclass('ChatMananger')
export class ChatMananger extends Component {
    @property(EditBox)
    private inputMessage: EditBox = null;

    @property(UIRoom)
    private ui: UIRoom = null;

    private socketManager: SocketManager = SocketManager.getInstance();

    private dataManager: DataManager = DataManager.getInstance();

    private onReceiveMessage = this.receiveMessage.bind(this);

    protected onLoad(): void {
        this.socketManager.on(EventName.RECEIVE_MESSAGE,this.onReceiveMessage )
    }

    clickSendMessage(): void{
        const message = this.inputMessage.string;
        if(!message){
            return;
        }

        console.log("Send Message")
        const roomAndPlayer = this.dataManager.getRoomAndPlayer()
        this.socketManager.emit(EventName.SEND_MESSAGE, {
            message: message,
            player: roomAndPlayer.player,
            roomId: roomAndPlayer.room.id
        }, this.renderMessage.bind(this))

        
        this.inputMessage.string = "";
    }

    renderMessage(message: string){
        console.log("Receive", message, 1)
        const roomAndPlayer = this.dataManager.getRoomAndPlayer()
        this.ui.renderMessage(roomAndPlayer.player.name,message,"L")
    }

    receiveMessage(message: string, name:string):void{
        console.log("Receive ", message)
        this.ui.renderMessage(name,message,"R")
    }

    protected onDestroy(): void {
        this.socketManager.off(EventName.RECEIVE_MESSAGE, this.onReceiveMessage);
    }
}

