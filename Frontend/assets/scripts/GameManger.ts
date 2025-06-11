import { _decorator, Color, Component, director, instantiate, Label, Node, Prefab, Quat, Scene, Vec3 } from 'cc';
import { UIManager } from './UIManager';
import { SocketManager } from './socket/SocketManager';
import { EventName } from './utils/EventName';
import { SnakeCtrl } from './snake/SnakeCtrl';
import { DataManager } from './DataManager';
import GlobalEventBus from './GlobalEventBus';
import { PowerUpType } from './power ups/PowerUpType';
import { AccelerateEffect } from './power ups/Accelerate/AccelerateEffect';
import { SlowEffect } from './power ups/Slow/SlowEffect';
import { SceneName } from './utils/SceneName';
const { ccclass, property } = _decorator;

@ccclass('GameManger')
export class GameManger extends Component {
    public static Instance: GameManger = null;
    socketManager = SocketManager.getInstance();
    playerId: String;
    roomId: String;
    type: String;

    @property({ type: [Prefab] })
    snakePrefabs: Prefab[] = [];

    @property(Label)
    private pingLabel: Label = null;

    private snakeCtrl: SnakeCtrl = null;
    public otherPlayers: Record<string, Node> = {};
    private dataManager: DataManager = DataManager.getInstance();

    private pingStart = 0;

    protected onLoad(): void {
        GlobalEventBus.on(EventName.DISCONNECT_NETWORK, this.onConnectionLost, this);
        GlobalEventBus.on(EventName.RECONNECT_NETWORK, this.onReconnection, this);

        if (GameManger.Instance === null) GameManger.Instance = this;

        const roomAndPlayer = this.dataManager.getRoomAndPlayer();

        this.playerId = roomAndPlayer.player.id;
        this.roomId = roomAndPlayer.room.id;
        this.type =  roomAndPlayer.player.type;

        this.socketManager.on(EventName.PLAYER_CREATED, this.PLAYER_CREATED);

        this.socketManager.on(EventName.NEW_PLAYER_JOINED, this.NEW_PLAYER_JOINED);

        this.socketManager.on(EventName.SNAKE_MOVED, this.SNAKE_MOVED);

        this.socketManager.on(EventName.FOOD_EATEN, this.FOOD_EATEN);

        this.socketManager.on(EventName.SNAKE_DIED, this.SNAKE_DIED);

        this.socketManager.on(EventName.TIMER_COUNT, this.TIMER_COUNT);

        this.socketManager.on(EventName.GAME_OVER, this.GAME_OVER);

        this.socketManager.on(EventName.APPLY_EFFECT, this.APPLY_EFFECT);

        this.socketManager.on(EventName.PLAYER_QUIT, this.PLAYER_QUIT);

        this.schedule(this.sendPing, 2);

        this.socketManager.on(EventName.PONG_CHECK, this.PONG_CHECK);
        
        window.addEventListener("beforeunload", () => {
            this.socketManager.emit(EventName.PLAYER_QUIT, {
                playerId: this.playerId,
                roomId: this.roomId
            });
        });
    }

    protected start() {
        this.socketManager.emit("JOIN_GAME", { playerId: this.playerId, roomId: this.roomId, type: this.type});
    }

    onPongCheck(){
        const ping = Date.now() - this.pingStart;
        this.pingLabel.string = `Ping: ${ping} ms`;
        if (ping < 10) {
            this.pingLabel.color = new Color(0, 255, 0);   
        } else if (ping < 100) {
            this.pingLabel.color = new Color(255, 255, 0);   
        } else if (ping >= 200) {
            this.pingLabel.color = new Color(255, 0, 0);     
        }
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

    clickBackMenu(){
        // this.dataManager.clear();
        localStorage.clear();
        director.resume();
        director.preloadScene(SceneName.WAITING_ROOM, () => {
            director.loadScene(SceneName.WAITING_ROOM);
        });
    }

   quitGame(){
        this.socketManager.emit(EventName.PLAYER_QUIT, {
            playerId: this.playerId,
            roomId: this.roomId
        });
    director.loadScene(SceneName.WAITING_ROOM);
    }

    private PLAYER_CREATED = this.onPlayerCreated.bind(this);
    private NEW_PLAYER_JOINED = this.onNewPlayerJoined.bind(this);
    private SNAKE_MOVED = this.onSnakeMove.bind(this);
    private FOOD_EATEN = this.onFoodEaten.bind(this);
    private SNAKE_DIED = this.onSnakeDied.bind(this);
    private TIMER_COUNT = this.onTimerCount.bind(this);
    private GAME_OVER = this.onGameOver.bind(this);
    private APPLY_EFFECT = this.onApplyEffect.bind(this);
    private PLAYER_QUIT = this.onPlayerQuit.bind(this);

    private PONG_CHECK = this.onPongCheck.bind(this);

    onPlayerCreated(data){
        const { playerId, x, y, rot, snakeType } = data;
        this.spawnSnake(playerId, new Vec3(x, y, 0), snakeType);
        UIManager.Instance.updateScore(playerId, 0);
    }

    onNewPlayerJoined(data){
        const { playerId, x, y, rot, snakeType } = data;
        if (playerId === this.playerId) return;
        this.spawnOtherSnake(playerId, new Vec3(x, y, 0), snakeType);
        UIManager.Instance.updateScore(playerId, 0);
    }

    onSnakeMove(data){
        const { id, x, y, rot, roomId } = data;
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
    }

    onFoodEaten(data){
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
    }

    onSnakeDied(data){
        const { playerId } = data;
        const playerNode = this.otherPlayers[playerId];
        if (playerNode) {
            const snakeCtrl = playerNode.getComponent(SnakeCtrl);
            if (snakeCtrl) snakeCtrl.destroySnake(); 
            else playerNode.destroy(); // ensure destroy
            delete this.otherPlayers[playerId];
        }
    }

    onTimerCount(timer){
        UIManager.Instance.updateTimer(timer); 
    }

    async onGameOver(){
        UIManager.Instance.displayGameOverPanel();  
            const base64Image = await UIManager.Instance.screenShot();
            this.socketManager.emit("SAVE_SCORE", {
                playerId: this.playerId,
                roomId: this.roomId,
                imageBase64: base64Image,
            })
            director.pause();
    }

    onApplyEffect(data){
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
    }

    onPlayerQuit(data){
        const { playerId } = data;
            const playerNode = this.otherPlayers[playerId];
            if (playerNode) {
                const snakeCtrl = playerNode.getComponent(SnakeCtrl);
                if (snakeCtrl) snakeCtrl.destroySnake(); 
                else playerNode.destroy(); 
                delete this.otherPlayers[playerId];
            }
    }

    sendPing() {
        this.pingStart = Date.now();
        this.socketManager.emit(EventName.PING_CHECK, null);
    }

    onDestroy() {
        this.socketManager.off(EventName.PONG_CHECK, this.PONG_CHECK);
        this.socketManager.off(EventName.PLAYER_CREATED, this.PLAYER_CREATED);
        this.socketManager.off(EventName.NEW_PLAYER_JOINED, this.NEW_PLAYER_JOINED);
        this.socketManager.off(EventName.SNAKE_MOVED, this.SNAKE_MOVED);
        this.socketManager.off(EventName.FOOD_EATEN, this.FOOD_EATEN);
        this.socketManager.off(EventName.SNAKE_DIED, this.SNAKE_DIED);
        this.socketManager.off(EventName.TIMER_COUNT, this.TIMER_COUNT);
        this.socketManager.off(EventName.GAME_OVER, this.GAME_OVER);
        this.socketManager.off(EventName.APPLY_EFFECT, this.APPLY_EFFECT);
        this.socketManager.off(EventName.PLAYER_QUIT, this.PLAYER_QUIT);

        GlobalEventBus.off(EventName.DISCONNECT_NETWORK, this.onConnectionLost, this);
        GlobalEventBus.off(EventName.RECONNECT_NETWORK, this.onReconnection, this);
        if (GameManger.Instance === this) 
            GameManger.Instance = null;
    }
}

