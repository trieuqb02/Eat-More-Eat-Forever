import { _decorator, Component, Node } from 'cc';
import { UI } from './UI';
import { SocketManager } from '../socket/SocketManager';
import { EventName } from '../utils/EventName';
import EventType from '../utils/EventType';
import { MyEvent } from '../entity/MyEvent';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    @property(UI)
    private ui: UI  

    private selectedItemId: string | null = null;

    private itemComponents: RoomItem[] = [];

    private socketMamager = SocketManager.getInstance();

    start() {
      this.socketMamager.emit(EventName.GET_ALL_ROOM, "get all room")
      this.socketMamager.on(EventName.GET_ALL_ROOM, this.renderUI.bind(this))
      this.socketMamager.on(EventName.NEW_ROOM, this.addRoomItem.bind(this))
      this.socketMamager.on(EventName.UPDATE_ROOM, this.updateRoomItem.bind(this))

      this.node.on(EventType.EVENT_CLICK_SELECT_ROOM, (event: MyEvent) => {
        this.ui.heighlightRoom(event.detail)
        event.propagationStopped = true;
      });
    }

    renderUI(data : RoomItem[]): void{
      data.forEach(element => {
        this.ui.addRoomItem(element)
      })
    }

    addRoomItem(data: RoomItem): void {
      this.ui.addRoomItem(data);
    }

    updateRoomItem(data: RoomItem): void {
      this.ui.addRoomItem(data);
    }

    update(deltaTime: number) {
        
    }
}

