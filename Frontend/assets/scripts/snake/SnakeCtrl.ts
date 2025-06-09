import { _decorator, Collider2D, Component, Contact2DType, Enum, EventKeyboard, find, Input, input, 
    instantiate, IPhysics2DContact, KeyCode, Node, Prefab, Quat, Vec3 } from 'cc';
import { Food } from '../food/Food';
import { SnakeTail } from './SnakeTail';
import { GameManger } from '../GameManger';
import { EventName } from '../utils/EventName';
import { EntityType } from './EntityType';
import { CameraFollowing } from '../CameraFollowing';
import { UIManager } from '../UIManager';
import { EffectCtrl } from '../power ups/EffectCtrl';
import { PowerUp } from '../power ups/PowerUp';
import { IAcceleratable } from '../power ups/Accelerate/IAcceleratable';
import { ISlowable } from '../power ups/Slow/ISlowable';
import { PowerUpType } from '../power ups/PowerUpType';
const { ccclass, property } = _decorator;

type SnakeStep = {
    position: Vec3,
    rotation: Quat,
};

@ccclass('SnakeCtrl')
export class SnakeCtrl extends Component implements IAcceleratable, ISlowable {
    // Effect
    private effectCtrl: EffectCtrl;

    slowEffect: { active: boolean; };
    accelerateEffect: { active: boolean; };

    @property
    moveSpeed: number;

    @property
    private steerSpeed: number = 100;
    private steerDirection: number = 1;
    private currentAngle = 0;

    private history: SnakeStep[] = [];

    @property({ type: Enum(EntityType) })
    snakeType: EntityType = EntityType.RED;

    @property({ type: Prefab })
    tailPrefab: Prefab = null;
    tailParent: Node = null;
    @property
    tailSpacing: number = 10;
    private tailList: Node[] = [];

    private _score: number = 0;
    get score() {return this._score;}
    set score(value) {
        if (value >= 0) this._score = value; }

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

        this.effectCtrl = new EffectCtrl(this);
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
        // steer
        this.steer(deltaTime);

        // move forward
        this.moveForward(deltaTime)

        // save history
        this.saveHistory(this.node.position.clone(), this.node.rotation.clone());

        // effect update
        this.effectCtrl.update(deltaTime);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {
        if (this.playerId !== GameManger.Instance.playerId) 
            return; 

        // eat food
        const food = otherCollider.getComponent(Food);
        if (food) {
            //this.addScore(food.scoreAmount);
            // Emit to server food type eaten
            GameManger.Instance.socketManager.emit("FOOD_EATEN", {
                playerId: GameManger.Instance.playerId,
                snakeType: this.snakeType,
                foodType: food.foodType 
            });
        } 

        // collide other snake
        const tail = otherCollider.getComponent(SnakeTail); 
        if (tail) {
            console.log("Collide tail");
            if (tail.playerId !== this.playerId) {
                this.schedule(()=>{
                    this.destroySnake();
                }, 0)

                // emit server
                GameManger.Instance.socketManager.emit("SNAKE_DIED", {
                    playerId: this.playerId,
                    killedBy: tail.playerId
                });
            }
        }

        // check collect power ups
        const powerUp = otherCollider.getComponent(PowerUp);
        if (powerUp) {
            // GameManger.Instance.socketManager.emit("POWER_UP_COLLECTED", {
            //     playerId: this.playerId, 
            //     powerUpType: PowerUpType.MYSTERY
            // });
            powerUp.pwUpActive(this); 
        }
    }

    // ==============> EFFECT ====================
    addEffect(effect){
        this.effectCtrl.addEffect(effect);
    }
    
    setAccelerate(enable, speedTimes) {
        this.moveSpeed *= speedTimes;
        // enable effect if had
    }

    setSlowSpeed(enable, speedTimes) {
        this.moveSpeed *= speedTimes;
        // enable effect if had
    }

    // ==============> SET ====================
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

    addScore(amount){
        this.score += amount;
        GameManger.Instance.setScore(this.score);
    }

    shrinkTail(amount) {
        for (let i = 0; i < amount && this.tailList.length > 0; i++) {
            const tailNode = this.tailList.pop();
            if (tailNode) {
                tailNode.destroy();
            }
        }
    }

    grow() {
        if (!this.tailPrefab || !this.tailParent) return;

        const newTail = instantiate(this.tailPrefab);
        this.tailParent.addChild(newTail);
        newTail.setPosition(this.node.getPosition());

        const delay = (this.tailList.length + 1) * this.tailSpacing;
        const tailComp = newTail.getComponent(SnakeTail);
        if (tailComp) {
            tailComp.playerId = this.playerId;
            tailComp.followDelay = delay;
            tailComp.snakeCtrl = this;
        }
        this.tailList.push(newTail);
    }

    destroySnake() {
        UIManager.Instance.removePlayer(this.playerId);
        this.tailList.forEach(tailNode => {
            tailNode.destroy();
        });
        this.tailList = [];

        this.node.destroy();
    }

    // ==============> GET ====================
    getHistory(): SnakeStep[] {
        return this.history;
    }

    // ==============> MOVE HANDLER ====================
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

    // ==============> INPUT HANDLER ====================
    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ARROW_LEFT || event.keyCode === KeyCode.KEY_A) {
            this.steerDirection = 1;
        } else if (event.keyCode === KeyCode.ARROW_RIGHT || event.keyCode === KeyCode.KEY_D) {
            this.steerDirection = -1;
        }

        // for test
        if (event.keyCode === KeyCode.KEY_T) {
            this.steerDirection = 1;
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

