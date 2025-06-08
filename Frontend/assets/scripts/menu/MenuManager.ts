import { _decorator, Component, director,instantiate,Node, Prefab, ScrollView } from 'cc';
import { SocketManager } from '../socket/SocketManager';
import { SceneName } from '../utils/SceneName';
import { Leader_Board } from './Leader-Board';
const { ccclass, property } = _decorator;

@ccclass('MenuManager')
export class MenuManager extends Component {
    @property(Node)
    private leaderBoardPanel: Node = null;

    @property(ScrollView)
    private list: ScrollView = null;

    @property(Prefab)
    private leaderBoardPrefab: Prefab = null;

    private socketManager: SocketManager = SocketManager.getInstance();

    clickPlayOnline(){
        this.socketManager.initSocket();
        director.loadScene(SceneName.WAITING_ROOM);
    }

    clickPlayOffline(){
        director.loadScene(SceneName.PLAY_OFFLINE);
    }

    async clickLeaderBoard(){
        this.leaderBoardPanel.active = !this.leaderBoardPanel.active;
        if(this.leaderBoardPanel.active){
            if(this.list.content.children.length == 0){
                const response: Response = await fetch("http://localhost:8080/api/v1/leader-board");
                if(response.status == 200){
                    const data = await response.json();
                    data.forEach(element => {
                        const leaderBoardPrefab = instantiate(this.leaderBoardPrefab);
                        const comp = leaderBoardPrefab.getComponent(Leader_Board);
                        comp.init(element);
                        this.list.content.addChild(leaderBoardPrefab);
                    });
                } 
            }
            
        }
    }

    
}

