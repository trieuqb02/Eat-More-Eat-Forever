import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { SnakeTail } from './SnakeTail';
const { ccclass, property } = _decorator;

@ccclass('SnakeManager')
export class SnakeManager extends Component {
    @property(Node)
    snakeHead: Node = null;

    @property(Prefab)
    tailPrefab: Prefab = null;

    @property(Node)
    tailParent: Node = null;

    @property
    tailCount: number = 5;

    start () {
        for (let i = 1; i <= this.tailCount; i++) {
            const tailNode = instantiate(this.tailPrefab);
            this.tailParent.addChild(tailNode);
            const tailScript = tailNode.getComponent(SnakeTail);
            tailScript.followDelay = i * 10; 
        }
    }
}

