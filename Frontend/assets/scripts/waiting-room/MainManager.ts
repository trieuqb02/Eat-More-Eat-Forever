import { _decorator, Component, Node } from 'cc';
import { UI } from './UI';
const { ccclass, property } = _decorator;

@ccclass('MainManager')
export class MainManager extends Component {
    @property(UI)
    ui: UI = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    onClickCreateRoomPanel(){
        this.ui.showAndHideCreateRoomPanel()
    }

    onClickFastJoin(){
        // handle fast join
    }

    onClickJoinRoom(){
        // handle fast join
    }
}

