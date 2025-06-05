import { _decorator, Collider2D, Component, Contact2DType, Enum, EventKeyboard, find, Input, input, 
    instantiate, IPhysics2DContact, KeyCode, Node, Prefab, Quat, Vec3 } from 'cc';
import { Food } from '../food/Food';
import { SnakeTail } from './SnakeTail';
import { GameManger } from '../GameManger';
import { EventName } from '../utils/EventName';
import { EntityType } from './EntityType';
import { CameraFollowing } from '../CameraFollowing';
const { ccclass, property } = _decorator;

type SnakeStep = {
    position: Vec3,
    rotation: Quat,
};

@ccclass('SnakeCtrl')
export class SnakeCtrl extends Component {
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

    playerId: String = "";

    onLoad() {
        // ref
        this.tailParent = find('Canvas/TailParent');

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected start() {
        this.currentAngle = this.node.eulerAngles.z;

        CameraFollowing.Instance.target = this.node;
    }

    update(deltaTime: number) {
        // steet
        this.steer(deltaTime);

        // move forward
        this.moveForward(deltaTime)

        // save history
        this.saveHistory(this.node.position.clone(), this.node.rotation.clone());
    }

    saveHistory(pos, rot){
        // save trans
        this.history.unshift({
            position: pos,
            rotation: rot,
        });

        // limit
        if (this.history.length > 1000) {
            this.history.pop();
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {
        
        if (this.playerId !== GameManger.Instance.playerId) 
            return; 
        console.log("onBeginContact");
        const food = otherCollider.getComponent(Food);
        if (food && food.foodType === this.snakeType) {
            console.log("Collide food");
            this.addScore(food.scoreAmount);
            // Emit to server food type eaten
            GameManger.Instance.socketManager.emit("FOOD_EATEN", {
                playerId: GameManger.Instance.playerId,
                type: food.foodType
            });
            //food.eat(); 
            //this.grow();
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
            tailComp.snakeCtrl = this;
        }
        this.tailList.push(newTail);
    }

    moveForward(dt){
        const forward = this.node.up;
        const moveDelta = forward.clone().multiplyScalar(this.moveSpeed * dt);
        this.node.setPosition(this.node.position.add(moveDelta));

        // emit to server
        GameManger.Instance.socketManager.emit(EventName.MOVE, {
            id: GameManger.Instance.playerId,
            x: this.node.position.x,
            y: this.node.position.y,
            rot: this.currentAngle
        });
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

