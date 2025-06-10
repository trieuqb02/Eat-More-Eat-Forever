import { _decorator, Component, EditBox, Node, UI } from 'cc';
import { SocketManager } from '../../socket/SocketManager';
import { EventName } from '../../utils/EventName';
import { DataManager } from '../../DataManager';
import { UIRoom } from '../UIRoom';
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
        this.socketManager.on(EventName.RECEIVE_MESSAGE,this.onReceiveMessage);
    }

    sendMessage(): void{
        const message = this.inputMessage.string;
        if(!message){
            return;
        }

        const roomAndPlayer = this.dataManager.getRoomAndPlayer()
        this.socketManager.emit(EventName.SEND_MESSAGE, {
            message: message,
            player: roomAndPlayer.player,
            roomId: roomAndPlayer.room.id
        }, this.renderMessage.bind(this))

        this.inputMessage.string = "";
    }

    renderMessage(message: string, time: string){
        this.ui.renderMessage("I",message, time,"L")
    }

    receiveMessage(message: string, name:string, time: string):void{
        this.ui.renderMessage(name,message,time,"R")
    }

    protected onDestroy(): void {
        this.socketManager.off(EventName.RECEIVE_MESSAGE, this.onReceiveMessage);
    }
}

