import { _decorator, Component, instantiate, Label, Node, Prefab, ScrollView } from 'cc';
import { Room } from './Room';
const { ccclass, property } = _decorator;

@ccclass('UI')
export class UI extends Component {
    @property(Node)
    private createRoomPanel: Node = null;

    @property(ScrollView)
    private listRoom: ScrollView = null;

    @property(Prefab)
    private roomItemPrefab: Prefab = null;

    public addRoomItem(roomItem: RoomItem): void {
        const room = instantiate(this.roomItemPrefab);

        room.getComponent(Room).init(roomItem);

        this.listRoom.content.addChild(room);
    }

    public updateRoom(roomItem: RoomItem): void {
        const nodeArr = this.listRoom.content.children;

        const node = nodeArr.find(element => {
            const idNode = element.getChildByName("Id").getComponent(Label).string;
            return idNode == roomItem.id;
        });

        node.getChildByName("Quantity").getComponent(Label).string = `${roomItem.quantityPresent}/${roomItem.quantityPlayer}`
    }

    public deleteRoom(id : string): void {
        const nodeArr = this.listRoom.content.children;

        const node = nodeArr.find(element => {
            const idNode = element.getChildByName("Id").getComponent(Label).string;
            return idNode == id;
        });

        this.listRoom.content.removeChild(node);
    }

    public showAndHideCreateRoomPanel(){
        this.createRoomPanel.active = !this.createRoomPanel.active;
    }
}

