import { _decorator, Color, Component, EditBox, instantiate, Label, Layout, Node, Prefab, ScrollView } from 'cc';
import { SocketManager } from '../socket/SocketManager';
import { DataManager } from '../DataManager';
import { EventName } from '../utils/EventName';
const { ccclass, property } = _decorator;

@ccclass('ChatInGame')
export class ChatInGame extends Component {
    @property(EditBox)
    private inputMessage: EditBox = null;

    @property(ScrollView)
    private chatList: ScrollView = null;

    @property(Prefab)
    private chatMessage: Prefab = null;
    
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
        this.message("I",message, time,"L")
    }

    receiveMessage(message: string, name:string, time: string):void{
        this.message(name,message,time,"R")
    }

    message(name: string, message: string, time: string,position: string){
        const chatMess = instantiate(this.chatMessage);
        const messageLB = chatMess.getChildByName("Message").getComponent(Label);
        messageLB.string = `[${time}] ${name}: ${message}`;
        this.chatList.content.addChild(chatMess);
    }

    protected onDestroy(): void {
        this.socketManager.off(EventName.RECEIVE_MESSAGE, this.onReceiveMessage);
    }
}

