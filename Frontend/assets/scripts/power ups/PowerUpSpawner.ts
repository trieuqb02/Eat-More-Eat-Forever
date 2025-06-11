import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { GameManger } from '../GameManger';
import { PowerUpType } from './PowerUpType';
import { EventName } from '../utils/EventName';
const { ccclass, property } = _decorator;

@ccclass('PowerUpSpawner')
export class PowerUpSpawner extends Component {
    @property(Prefab)
    pwPrefab: Prefab;

    private activePwUps: Map<PowerUpType, Node> = new Map();

    private SPAWN_POWER_UP = this.onSpawnPowerUp.bind(this);

    private POWER_UP_REMOVED = this.onPowerUpRemove.bind(this);
    
    protected start(): void {
        GameManger.Instance.socketManager.on(EventName.SPAWN_POWER_UP, this.SPAWN_POWER_UP);

        GameManger.Instance.socketManager.on(EventName.POWER_UP_REMOVED, this.POWER_UP_REMOVED);
    }

    onSpawnPowerUp(data){
        const { pwType, x, y } = data;
        this.spawn(pwType, new Vec3(x, y, 0));
    }

    onPowerUpRemove(type){
        if(this.activePwUps.size == 0) return;
            
        const pwNode = this.activePwUps.get(type);
        if (pwNode) {
            console.log("pw remove");
            pwNode.destroy();
            this.activePwUps.delete(type);
        }
    }



    spawn(type, position) {
        console.log("pw type: " + type);
        if (this.activePwUps.has(type)) return;
        if (!this.pwPrefab) return;
        const pw = instantiate(this.pwPrefab);
        this.node.addChild(pw);
        pw.setPosition(position);

        this.activePwUps.set(type, pw);
    }

    protected onDestroy(): void {
        GameManger.Instance.socketManager.off(EventName.SPAWN_POWER_UP, this.SPAWN_POWER_UP);
        GameManger.Instance.socketManager.off(EventName.POWER_UP_REMOVED, this.POWER_UP_REMOVED);
    }
}


