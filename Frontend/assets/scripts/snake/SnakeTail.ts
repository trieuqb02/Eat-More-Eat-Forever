import { _decorator, Component, Node } from 'cc';
import { SnakeHead } from './SnakeHead';
const { ccclass, property } = _decorator;

@ccclass('SnakeTail')
export class SnakeTail extends Component {
    @property(Node)
    head: Node = null;

    @property
    followDelay: number = 10; 

    private headScript: SnakeHead;

    start () {
        this.headScript = this.head.getComponent(SnakeHead);
    }

    update(deltaTime: number) {
        const history = this.headScript.getHistory();
        if (history.length > this.followDelay) {
            this.node.setPosition(history[this.followDelay]);
        }
    }
}

