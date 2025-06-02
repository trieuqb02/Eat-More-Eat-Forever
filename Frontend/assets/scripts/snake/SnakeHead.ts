import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SnakeHead')
export class SnakeHead extends Component {
    @property
    speed: number = 100;

    private direction: Vec3 = new Vec3(0, 0, 1); 
    private positions: Vec3[] = [];

    @property
    private steerSpeed: number = 100;
    private steerDirection: number = 1;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        const angle = this.node.eulerAngles.z + this.steerSpeed * this.steerDirection * deltaTime;
        this.node.setRotationFromEuler(0, 0, angle);

        // move forward
        const forward = new Vec3(1, 0, 0);
        const quat = this.node.rotation;
        const dir = Vec3.transformQuat(new Vec3(), forward, quat); 
        const movement = dir.multiplyScalar(this.speed * deltaTime);
        this.node.setPosition(this.node.position.clone().add(movement));

        this.positions.unshift(this.node.position.clone());

        if (this.positions.length > 1000) {
            this.positions.pop();
        }
    }

    getHistory(): Vec3[] {
        return this.positions;
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

