import { _decorator, Component, Quat, Vec3 } from 'cc';
import { SnakeCtrl } from './SnakeCtrl';
const { ccclass, property } = _decorator;

@ccclass('SnakeTail')
export class SnakeTail extends Component {
    @property
    followDelay: number = 10; 

    private tempPos = new Vec3();
    private tempRot = new Quat();
    @property
    private speed: number = 10;

    snakeCtrl: SnakeCtrl;
    playerId: String = '';

    update(deltaTime: number) {
        if (!this.snakeCtrl) return;
        const history = this.snakeCtrl.getHistory();
        if (history.length > this.followDelay) {
            const step = history[this.followDelay];

            // Lerp move
            Vec3.lerp(this.tempPos, this.node.position, step.position, deltaTime * this.speed);
            this.node.setPosition(this.tempPos);

            // Lerp rotate
            Quat.slerp(this.tempRot, this.node.rotation, step.rotation, deltaTime * this.speed);
            this.node.setRotation(this.tempRot);
        }
    }
}

