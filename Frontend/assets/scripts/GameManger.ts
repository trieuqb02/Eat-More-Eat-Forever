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

    @property(Prefab)
    snakePrefab: Prefab;

    public otherPlayers: Record<string, Node> = {};

    protected onLoad(): void {
        if (GameManger.Instance === null) GameManger.Instance = this; // singleton

        this.playerId = 'player_' + Math.floor(Math.random() * 1000000).toString(); // id test

        this.socketManager.on("PLAYER_CREATED", (data) => {
            const { playerId, x, y, rot } = data;
            this.spawnSnake(playerId, new Vec3(x, y, 0)); // own
        });

        this.socketManager.on("NEW_PLAYER_JOINED", (data) => {
            console.log("New player join");
            const { playerId, x, y, rot } = data;
            if (playerId === this.playerId) return;
            this.spawnOtherSnake(playerId, new Vec3(x, y, 0)); // another
        });

        this.socketManager.on(EventName.SNAKE_MOVED, (data) => {
            
            const { id, x, y, rot } = data;

            if (id === this.playerId) return;

            const player = this.otherPlayers[id];
            if (player) {
                player.setPosition(new Vec3(x, y, 0));
                player.setRotationFromEuler(0, 0, rot);
            }
        });

        this.socketManager.on("FOOD_EATEN", (data) => {
            const { playerId, type } = data;

            if (playerId === this.playerId) return;

            const snakeNode = this.otherPlayers[playerId];
            if (snakeNode) {
                const snakeCtrl = snakeNode.getComponent(SnakeCtrl);
                if (snakeCtrl) {
                    snakeCtrl.grow();
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
                playerNode.destroy();
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

    spawnSnake(id, pos) {
        console.log("Spawn snake");
        const snakeNode = instantiate(this.snakePrefab);
        snakeNode.setPosition(pos);
        this.node.parent.addChild(snakeNode);

        const ctrl = snakeNode.getComponent(SnakeCtrl);
        ctrl.enabled = true;
    }

    spawnOtherSnake(id, pos) {
        console.log("Spawn other snake");
        const snakeNode = instantiate(this.snakePrefab);
        snakeNode.setPosition(pos);
        this.node.parent.addChild(snakeNode);
        this.otherPlayers[id] = snakeNode;

        const ctrl = snakeNode.getComponent(SnakeCtrl);
        ctrl.enabled = false;
    }
}

