import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PowerUp')
export abstract class PowerUp extends Component {
    abstract pwUpActive(nodeData);
}


