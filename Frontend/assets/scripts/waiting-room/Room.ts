import { _decorator, Button, Color, Component, EventTouch, Label, Node, Sprite } from 'cc';
import { IBaseComponent } from '../base/IBaseComponent';
import { MyEvent } from '../entity/MyEvent'
import EventType from '../utils/EventType';
const { ccclass, property } = _decorator;

@ccclass('Room')
export class Room extends Component implements IBaseComponent {
    private id: string;
    private state: string;
    private maxPlayers: number;
    private quantityPresent: number;
    private nameRoom: string;

    init(data: RoomItem): void {
        this.id = data.id;
        this.state = data.state;
        this.maxPlayers = data.maxPlayers;
        this.quantityPresent = data.quantityPresent;
        this.nameRoom = data.name;
    }

    protected start(): void {
        const id = this.id.slice(0,8);
        this.node.getChildByPath("Id")!.getComponent(Label).string = id;
        this.node.getChildByPath("State")!.getComponent(Label).string = this.state;
        this.node.getChildByPath("Quantity")!.getComponent(Label).string = `${this.quantityPresent}/${this.maxPlayers}`;
        this.node.getChildByPath("Name")!.getComponent(Label).string= this.nameRoom;
    }


    onClick(event: EventTouch) {
        this.node.dispatchEvent( new MyEvent(EventType.EVENT_CLICK_SELECT_ROOM, true, this.id) );
    }

    setSelected(isSelected: boolean) {
        const sprite = this.node.getComponent(Sprite);
        if (sprite) {
            sprite.color = isSelected ? new Color(100, 200, 255) : new Color(255, 255, 255);
        }
    }

    getId(): string {
        return this.id;
    }
}

