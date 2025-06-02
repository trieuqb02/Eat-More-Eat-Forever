import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {

    roomList: RoomItem[] = [
        {
          id: "001",
          state: "Đang chờ",
          quantityPlayer: 4,
          quantityPresent: 2,
          nameRoom: "Phòng Siêu Tốc"
        },
        {
          id: "002",
          state: "Đang chơi",
          quantityPlayer: 4,
          quantityPresent: 4,
          nameRoom: "Phòng Cao Thủ"
        },
        {
          id: "003",
          state: "Đang chờ",
          quantityPlayer: 6,
          quantityPresent: 1,
          nameRoom: "Phòng Tân Thủ"
        }
      ];
      
    start() {

    }

    update(deltaTime: number) {
        
    }
}

