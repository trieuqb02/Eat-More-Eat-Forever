import { _decorator, Component, director } from 'cc';
import { SocketManager } from '../socket/SocketManager';
import { SceneName } from '../utils/SceneName';
const { ccclass, property } = _decorator;

@ccclass('MenuManager')
export class MenuManager extends Component {
    private socketManager: SocketManager = SocketManager.getInstance();

    clickPlayOnline(){
        this.socketManager.initSocket();
        director.loadScene(SceneName.WAITING_ROOM)
    }

    clickPlayOffline(){

    }

    clickLeaderBoard(){

    }
}

