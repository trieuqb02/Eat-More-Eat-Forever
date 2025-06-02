import { _decorator, Component, EventKeyboard, Input, input, instantiate, KeyCode, math, Node, Prefab, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SnakeCtrl')
export class SnakeCtrl extends Component {
    // move
    @property
    private moveSpeed: number = 5;
    @property
    private steerSpeed: number = 100;
    @property
    private bodySpeed: number = 5;
    @property
    private gap: number = 10;
    private steerDirection: number = 1;

    @property(Prefab)
    private bodyPrefab: Prefab;

    // Lists
    private bodyParts: Node[] = [];
    private positionsHistory: Vec3[] = [];

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected start(): void {
        this.growSnake();
        this.growSnake();
        this.growSnake();
        this.growSnake();
    }

    protected update(dt: number): void {
        // Tính góc xoay mới (chỉ trên trục Z)
        const angle = this.node.eulerAngles.z + this.steerSpeed * this.steerDirection * dt;
        this.node.setRotationFromEuler(0, 0, angle);

        // move forward
        const forward = new Vec3(1, 0, 0); // hướng gốc là qua phải (trục X)
        const quat = this.node.rotation;
        const dir = Vec3.transformQuat(new Vec3(), forward, quat); // dir sau quay
        const movement = dir.multiplyScalar(this.moveSpeed * dt);
        this.node.setPosition(this.node.position.clone().add(movement));

        this.positionsHistory.unshift(this.node.worldPosition.clone());

        for (let i = 0; i < this.bodyParts.length; i++) {
            const index = Math.min(i * this.gap, this.positionsHistory.length - 1);
            const point = this.positionsHistory[index];

            const body = this.bodyParts[i];
            const bodyPos = body.worldPosition;
            let moveDir = point.subtract(bodyPos);

            const dist = moveDir.length();

            if (dist > 0.001) {
                moveDir.normalize();
                const newPos = bodyPos.add(moveDir.multiplyScalar(this.bodySpeed * dt));
                body.setWorldPosition(newPos);

                const angleDeg = Math.atan2(moveDir.y, moveDir.x) * 180 / Math.PI;
                body.setRotationFromEuler(0, 0, angleDeg);
            }

            // const angle = Math.atan2(moveDir.y, moveDir.x) * 180 / Math.PI;
            // body.setRotationFromEuler(0, 0, angle);
        }
        const maxHistory = this.bodyParts.length * this.gap + 10;
        if (this.positionsHistory.length > maxHistory) {
            this.positionsHistory.length = maxHistory;
        }
        
        // // Move forward
        // const forward = this.node.forward.clone();
        // const movement = forward.multiplyScalar(this.moveSpeed * dt);
        // this.node.position = this.node.position.add(movement);

        // // Steer
        // let euler = this.node.eulerAngles.clone();
        // euler.y += this.steerSpeed * this.steerDirection * dt;
        // let quat = new Quat();
        // Quat.fromEuler(quat, euler.x, euler.y, euler.z);
        // this.node.rotation = quat;

        // // Store position history
        // this.positionsHistory.unshift(this.node.worldPosition.clone());

        // // Move body parts
        // for (let i = 0; i < this.bodyParts.length; i++) {
        //     const index = Math.min(i * this.gap, this.positionsHistory.length - 1);
        //     const point = this.positionsHistory[index];

        //     const body = this.bodyParts[i];
        //     const bodyPos = body.worldPosition;
        //     const moveDirection = point.subtract(bodyPos).normalize();

        //     const newPos = bodyPos.add(moveDirection.multiplyScalar(this.bodySpeed * dt));
        //     body.setWorldPosition(newPos);

        //     // Look at
        //     const lookAt = point.clone().subtract(body.worldPosition).normalize();
        //     body.lookAt(point);
        // }
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

    private growSnake() {
        if (!this.bodyPrefab) {
            console.error('Prefab is missing!');
            return;
        }
        // Instantiate body instance and
        // add it to the list
        const body = instantiate(this.bodyPrefab);
        this.node.parent!.addChild(body);
        this.bodyParts.push(body);
    }
}

