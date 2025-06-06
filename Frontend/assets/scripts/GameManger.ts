import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { UIManager } from './UIManager';
import { SocketManager } from './socket/SocketManager';
import { EventName } from './utils/EventName';
import { SnakeCtrl } from './snake/SnakeCtrl';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {
    public static Instance: GameManger = null; // singleton

    socketManager = SocketManager.getInstance();

    playerId: String;

    @property({ type: [Prefab] })
    snakePrefabs: Prefab[] = [];

    private snakeCtrl: SnakeCtrl = null;

    public otherPlayers: Record<string, Node> = {};

    protected onLoad(): void {
        if (GameManger.Instance === null) GameManger.Instance = this; // singleton

        this.playerId = 'player_' + Math.floor(Math.random() * 1000000).toString(); // id test

        this.socketManager.on("PLAYER_CREATED", (data) => {
            const { playerId, x, y, rot, snakeType } = data;
            this.spawnSnake(playerId, new Vec3(x, y, 0), snakeType); // own
        });

        this.socketManager.on("NEW_PLAYER_JOINED", (data) => {
            const { playerId, x, y, rot, snakeType } = data;
            if (playerId === this.playerId) return;
            console.log("New player join");
            this.spawnOtherSnake(playerId, new Vec3(x, y, 0), snakeType); // another
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
            const { playerId, isMapping } = data;

            if (playerId === this.playerId && this.snakeCtrl){
                console.log("Own Snake growww");
                if (isMapping) {
                    
                    this.snakeCtrl.grow();
                } else {
                    this.snakeCtrl.shrinkTail(3);
                    //this.snakeCtrl.addScore(-10);
                } 
                return;
            }

            const snakeNode = this.otherPlayers[playerId];
            if (snakeNode) {
                console.log("other eat");

                const snakeCtrl = snakeNode.getComponent(SnakeCtrl);
                if (snakeCtrl) {
                    if (isMapping) {
                        snakeCtrl.grow();
                    } else {
                        snakeCtrl.shrinkTail(3);
                    }
                }
            }
        });

        // when Player quit game
        window.addEventListener("beforeunload", () => {
            this.socketManager.emit("PLAYER_QUIT", {
                playerId: this.playerId
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
    onDestroy() {
        if (GameManger.Instance === this) 
            GameManger.Instance = null;
    }

    protected start(): void {
        this.socketManager.emit("JOIN_GAME", { playerId: this.playerId });
    }

    setScore(score){
        UIManager.Instance.setScore(score);
    }

    spawnSnake(id, pos, snakeType) {
        console.log("Spawn snake");
        const snakeNode = instantiate(this.snakePrefabs[snakeType]);
        snakeNode.setPosition(pos);
        this.node.parent.addChild(snakeNode);

        this.snakeCtrl = snakeNode.getComponent(SnakeCtrl);
        this.snakeCtrl.enabled = true;
        this.snakeCtrl.playerId = this.playerId;
    }

    spawnOtherSnake(id, pos, snakeType) {
        console.log("Spawn other snake");
        const snakeNode = instantiate(this.snakePrefabs[snakeType]);
        snakeNode.setPosition(pos);
        this.node.parent.addChild(snakeNode);
        this.otherPlayers[id] = snakeNode;

        const ctrl = snakeNode.getComponent(SnakeCtrl);
        ctrl.enabled = false;
        ctrl.playerId = id;
    }
}

