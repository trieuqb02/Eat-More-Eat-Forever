import { _decorator, Component, director, instantiate, Node, Prefab, Scene, Vec3 } from 'cc';
import { UIManager } from './UIManager';
import { SocketManager } from './socket/SocketManager';
import { EventName } from './utils/EventName';
import { SnakeCtrl } from './snake/SnakeCtrl';
import { DataManager } from './DataManager';
import GlobalEventBus from './GlobalEventBus';
import { SceneName } from './utils/SceneName';
import { PowerUpType } from './power ups/PowerUpType';
import { AccelerateEffect } from './power ups/Accelerate/AccelerateEffect';
import { SlowEffect } from './power ups/Slow/SlowEffect';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {
    public static Instance: GameManger = null; // singleton

    socketManager = SocketManager.getInstance();
    playerId: String;
    roomId: String;
    type: String;

    @property({ type: [Prefab] })
    snakePrefabs: Prefab[] = [];

    private snakeCtrl: SnakeCtrl = null;
    public otherPlayers: Record<string, Node> = {};
    private dataManager: DataManager = DataManager.getInstance()

    protected onLoad(): void {
        GlobalEventBus.on(EventName.DISCONNECT_NETWORK, this.onConnectionLost, this);
        GlobalEventBus.on(EventName.RECONNECT_NETWORK, this.onReconnection, this);

        if (GameManger.Instance === null) GameManger.Instance = this; // singleton

        const roomAndPlayer = this.dataManager.getRoomAndPlayer();

        this.playerId = roomAndPlayer.player.id;
        this.roomId = roomAndPlayer.room.id;
        this.type =  roomAndPlayer.player.type;

        this.socketManager.on("PLAYER_CREATED", (data) => {
            const { playerId, x, y, rot, snakeType } = data;
            this.spawnSnake(playerId, new Vec3(x, y, 0), snakeType); // own
            UIManager.Instance.updateScore(playerId, 0);
        });

        this.socketManager.on("NEW_PLAYER_JOINED", (data) => {
            const { playerId, x, y, rot, snakeType } = data;
            if (playerId === this.playerId) return;
            this.spawnOtherSnake(playerId, new Vec3(x, y, 0), snakeType); // another
            UIManager.Instance.updateScore(playerId, 0);
        });

        this.socketManager.on(EventName.SNAKE_MOVED, (data) => {
            const { id, x, y, rot } = data;
            if (id === this.playerId) return;

            const player = this.otherPlayers[id];
            if (player) {
                player.setPosition(new Vec3(x, y, 0));
                player.setRotationFromEuler(0, 0, rot);

                // save history other snake
                const snakeCtrl = player.getComponent(SnakeCtrl);
                if (snakeCtrl) {
                    snakeCtrl.saveHistory(player.position.clone(), player.rotation.clone());
                }
            }
        });

        this.socketManager.on("FOOD_EATEN", (data) => {
            const { playerId, isMapping, score } = data;
            if (playerId === this.playerId && this.snakeCtrl && this.snakeCtrl.isOwner){
                if (isMapping) {
                    this.snakeCtrl.grow();
                } else {
                    this.snakeCtrl.shrinkTail(1);
                } 
                UIManager.Instance.setScore(score);
                UIManager.Instance.updateScore(playerId, score);
                return; 
            }

            const snakeNode = this.otherPlayers[playerId];
            if (snakeNode) {
                const snakeCtrl = snakeNode.getComponent(SnakeCtrl);
                if (snakeCtrl) {
                    if (isMapping) {
                        snakeCtrl.grow();
                    } else {
                        snakeCtrl.shrinkTail(1);
                    }
                    UIManager.Instance.updateScore(playerId, score);
                }
            }
        });

        this.socketManager.on("SNAKE_DIED", (data) => {
            const { playerId } = data;
            const playerNode = this.otherPlayers[playerId];
            if (playerNode) {
                const snakeCtrl = playerNode.getComponent(SnakeCtrl);
                if (snakeCtrl) snakeCtrl.destroySnake(); 
                else playerNode.destroy(); // ensure destroy
                delete this.otherPlayers[playerId];
            }
        });

        this.socketManager.on("TIMER_COUNT", (timer) => {
            UIManager.Instance.updateTimer(timer); 
        });

        this.socketManager.on("GAME_OVER", async () => {
            UIManager.Instance.displayGameOverPanel(); 
            this.scheduleOnce(()=>{
                // destroy own snake
                if (this.snakeCtrl) {
                    this.snakeCtrl.destroySnake();
                    this.snakeCtrl = null;
                }
                // destroy others snake
                for (let playerId in this.otherPlayers) {
                    const node = this.otherPlayers[playerId];
                    if (!node) continue;
                    
                    const snakeCtrl = node.getComponent(SnakeCtrl);
                    if (snakeCtrl) {
                        snakeCtrl.destroySnake();
                    } else {
                        node.destroy();
                    }
                }
                this.otherPlayers = {};
            }, 0);

            const base64Image = await UIManager.Instance.screenShot(); 
            this.socketManager.emit("SAVE_SCORE", {
                playerId: this.playerId,
                roomId: this.roomId,
                score: this.getScore(),
                imageBase64: base64Image,
            })

        });

        this.socketManager.on("APPLY_EFFECT", (data) => {
            const { playerId, effectType, duration } = data;

            // own
            if (playerId === this.playerId && this.snakeCtrl) {
                this.applyEffectToSnake(this.snakeCtrl, effectType, duration);
            }

            // others
            const otherSnake = this.otherPlayers[playerId];
            if (otherSnake) {
                const snakeCtrl = otherSnake.getComponent(SnakeCtrl);
                if (snakeCtrl) {
                    this.applyEffectToSnake(snakeCtrl, effectType, duration);
                }
            }
        });

        // when Player quit game
        window.addEventListener("beforeunload", () => {
            this.socketManager.emit("PLAYER_QUIT", {
                playerId: this.playerId,
                roomId: this.roomId
            });
        });

        this.socketManager.on("PLAYER_QUIT", (data) => {
            const { playerId } = data;
            const playerNode = this.otherPlayers[playerId];
            if (playerNode) {
                const snakeCtrl = playerNode.getComponent(SnakeCtrl);
                if (snakeCtrl) snakeCtrl.destroySnake(); 
                else playerNode.destroy(); // ensure destroy
                delete this.otherPlayers[playerId];
            }
        });
    }

    protected start() {
        this.socketManager.emit("JOIN_GAME", { playerId: this.playerId, roomId: this.roomId, type: this.type});
    }

    applyEffectToSnake(snakeCtrl: SnakeCtrl, effectType: number, duration: number) {
        switch (effectType) {
            case PowerUpType.ACCELERATE:
                snakeCtrl.addEffect(new AccelerateEffect(duration, snakeCtrl));
                break;
            case PowerUpType.SLOW:
                snakeCtrl.addEffect(new SlowEffect(duration, snakeCtrl));
                break;
            default:
                console.warn("Unknown effect: ", effectType);
        }
    }

    setScore(score){
        UIManager.Instance.setScore(score);
    }

    getScore(){
        return this.snakeCtrl.score;
    }
    
    arr: any[] = [ {id: "RED", pos: 0},{id: "GREEN", pos: 1},{id: "BLUE", pos: 2},{id: "YELLOW", pos: 3} ]

    spawnSnake(id, pos, snakeType) {
        let type;
        this.arr.forEach(ele => {
            if(ele.id == snakeType){
                type = ele.pos
            }
        })
        const snakeNode = instantiate(this.snakePrefabs[type]);
        snakeNode.setPosition(pos);
        this.node.addChild(snakeNode);

        this.snakeCtrl = snakeNode.getComponent(SnakeCtrl);
        //this.snakeCtrl.enabled = true;
        this.snakeCtrl.isOwner = true;
        this.snakeCtrl.playerId = this.playerId;
    }

    spawnOtherSnake(id, pos, snakeType) {
        let type;
        this.arr.forEach(ele => {
            if(ele.id == snakeType){
                type = ele.pos
            }
        })
        const snakeNode = instantiate(this.snakePrefabs[type]);
        snakeNode.setPosition(pos);
        this.node.addChild(snakeNode);
        this.otherPlayers[id] = snakeNode;

        const ctrl = snakeNode.getComponent(SnakeCtrl);
        //ctrl.enabled = false;
        ctrl.isOwner = false;
        ctrl.playerId = id;
    }

    onConnectionLost(){
        this.snakeCtrl.enabled = false;
        UIManager.Instance.showDisconnectPanel();
    }

    onReconnection(){
        this.snakeCtrl.enabled = true;
        UIManager.Instance.showDisconnectPanel();
    }

    onDestroy() {
        GlobalEventBus.off(EventName.DISCONNECT_NETWORK, this.onConnectionLost, this);
        GlobalEventBus.off(EventName.RECONNECT_NETWORK, this.onReconnection, this);
        if (GameManger.Instance === this) 
            GameManger.Instance = null;
    }
}

