import { _decorator, Component, Node } from 'cc';
import { PowerUpType } from './PowerUpType';
const { ccclass, property } = _decorator;

@ccclass('PowerUp')
export abstract class PowerUp extends Component {
    @property
    duration: number = 5;
    @property
    powerUpType: PowerUpType = PowerUpType.ACCELERATE;
    abstract pwUpActive(nodeData);
}


