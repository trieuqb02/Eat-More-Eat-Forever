import { _decorator, Component, Label, Node } from 'cc';
import { IBaseComponent } from '../base/IBaseComponent';
import { Player } from '../entity/Player';
const { ccclass, property } = _decorator;

@ccclass('PlayerInfo')
export class PlayerInfo extends Component implements IBaseComponent{
    
    private id: string;
    private namePlayer: string;
    private isHost: boolean;
    private isReady: boolean;

    init(data: Player): void {
        this.id = data.id;
        this.namePlayer = data.name;
        this.isHost = data.isHost;
        this.isReady = data.isReady;
    }

    start() {
        this.node.getChildByPath("Name")!.getComponent(Label).string = this.namePlayer;
        this.node.getChildByPath("Ready").active = this.isReady;
    }

    changeReady(isReady: boolean){
        this.node.getChildByPath("Ready").active = isReady;
    }

    getId(){
        return this.id;
    }
}

