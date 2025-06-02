import { _decorator, Color, Component, Label, Node, Sprite } from 'cc';
import { IBaseComponent } from '../base/IBaseComponent';
const { ccclass, property } = _decorator;

@ccclass('Room')
export class Room extends Component implements IBaseComponent {
    private id: string;
    private state: string;
    private quantityPlayer: number;
    private quantityPresent: number;
    private nameRoom: string;

    init(data: any): void {
        this.id = data.id;
        this.state = data.state;
        this.quantityPlayer = data.quantityPlayer;
        this.quantityPresent = data.quantityPresent;
        this.nameRoom = data.nameRoom;
    }

    protected start(): void {
        this.node.getChildByPath("Id")!.getComponent(Label).string = this.id;
        this.node.getChildByPath("State")!.getComponent(Label).string = this.state;
        this.node.getChildByPath("Quantity")!.getComponent(Label).string = `${this.quantityPresent}/${this.quantityPlayer}`;
        this.node.getChildByPath("Name")!.getComponent(Label).string= this.nameRoom;
    }
}

