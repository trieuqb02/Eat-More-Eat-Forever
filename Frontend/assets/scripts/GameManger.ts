import { _decorator, Component, Node } from 'cc';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {
    public static Instance: GameManger = null; // singleton

    protected onLoad(): void {
        if (GameManger.Instance === null) GameManger.Instance = this; // singleton
    }
    onDestroy() {
        if (GameManger.Instance === this) 
            GameManger.Instance = null;
    }

    setScore(score){
        UIManager.Instance.setScore(score);
    }
}

