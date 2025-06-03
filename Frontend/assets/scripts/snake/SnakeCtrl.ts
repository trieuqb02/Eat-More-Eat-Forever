import { _decorator, Collider2D, Component, Contact2DType, Enum, EventKeyboard, Input, input, 
    instantiate, IPhysics2DContact, KeyCode, Node, Prefab, Quat, Vec3 } from 'cc';
import { Food } from '../food/Food';
import { SnakeTail } from './SnakeTail';
import { GameManger } from '../GameManger';
const { ccclass, property } = _decorator;

type SnakeStep = {
    position: Vec3,
    rotation: Quat,
};

export enum EntityType {
    RED,
    GREEN,
    BLUE
}

@ccclass('SnakeCtrl')
export class SnakeCtrl extends Component {
    public static Instance: SnakeCtrl = null; // singleton

    @property
    moveSpeed: number = 100;

    @property
    private steerSpeed: number = 100;
    private steerDirection: number = 1;
    private currentAngle = 0;

    private history: SnakeStep[] = [];

    @property({ type: Enum(EntityType) })
    snakeType: EntityType = EntityType.RED;

    @property({ type: Prefab })
    tailPrefab: Prefab = null;
    @property({ type: Node })
    tailParent: Node = null;
    @property
    tailSpacing: number = 10;
    private tailList: Node[] = [];

    private score: number = 0;

    onLoad() {
        if (SnakeCtrl.Instance === null) SnakeCtrl.Instance = this; // singleton

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDestroy() {
        if (SnakeCtrl.Instance === this) 
            SnakeCtrl.Instance = null;

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected start(): void {
        this.currentAngle = this.node.eulerAngles.z;
    }

    update(deltaTime: number) {
        // steet
        this.steer(deltaTime);

        // move forward
        this.moveForward(deltaTime)

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

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {
        const food = otherCollider.getComponent(Food);
        if (food && food.foodType === this.snakeType) {
            this.addScore(food.scoreAmount);
            food.eat(); 
            this.grow();
        } 
    }

    addScore(amount){
        this.score += amount;
        GameManger.Instance.setScore(this.score);
    }

    grow() {
        if (!this.tailPrefab || !this.tailParent) return;

        const newTail = instantiate(this.tailPrefab);
        this.tailParent.addChild(newTail);

        const delay = (this.tailList.length + 1) * this.tailSpacing;
        const tailComp = newTail.getComponent(SnakeTail);
        if (tailComp) {
            tailComp.followDelay = delay;
        }
        this.tailList.push(newTail);
    }

    moveForward(dt){
        const forward = this.node.up;
        const moveDelta = forward.clone().multiplyScalar(this.moveSpeed * dt);
        this.node.setPosition(this.node.position.add(moveDelta));
    }

    steer(dt){
        this.currentAngle += this.steerSpeed * this.steerDirection * dt;
        this.node.setRotationFromEuler(0, 0, this.currentAngle);
    }

    getHistory(): SnakeStep[] {
        return this.history;
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.KEY_A) {
            this.steerDirection = 1;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT || event.keyCode === KeyCode.KEY_D) {
            this.steerDirection = -1;
        }
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.ARROW_RIGHT
            || event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.KEY_D
        ) {
            this.steerDirection = 0;
        }
    }
}

