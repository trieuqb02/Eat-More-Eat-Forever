import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

type SnakeStep = {
    position: Vec3,
    rotation: Quat,
};

@ccclass('SnakeHead')
export class SnakeHead extends Component {
    @property
    moveSpeed: number = 100;

    @property
    private steerSpeed: number = 100;
    private steerDirection: number = 1;

    private history: SnakeStep[] = [];

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        // rotate
        const angle = this.node.eulerAngles.z + this.steerSpeed * this.steerDirection * deltaTime;
        this.node.setRotationFromEuler(0, 0, angle);

        // move forward
        const forward = this.node.up;
        const moveDelta = forward.clone().multiplyScalar(this.moveSpeed * deltaTime);
        this.node.setPosition(this.node.position.add(moveDelta));

        // save trans
        this.history.unshift({
            position: this.node.position.clone(),
            rotation: this.node.rotation.clone(),
        });

        // limit
        if (this.history.length > 1000) {
            this.history.pop();
        }
    }

    getHistory(): SnakeStep[] {
        return this.history;
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT) {
            this.steerDirection = 1;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT) {
            this.steerDirection = -1;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.ARROW_RIGHT) {
            this.steerDirection = 0;
        }
    }
}

