import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    public static Instance: UIManager = null; // singleton

    @property(Label)
    scoreLabel: Label;

    protected onLoad(): void {
        if (UIManager.Instance === null) UIManager.Instance = this; // singleton
    }
    onDestroy() {
        if (UIManager.Instance === this) 
            UIManager.Instance = null;
    }

    setScore(score){
        this.scoreLabel.string = score;
    }
}

