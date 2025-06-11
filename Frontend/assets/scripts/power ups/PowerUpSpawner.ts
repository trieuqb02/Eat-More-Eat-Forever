import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { GameManger } from '../GameManger';
import { PowerUpType } from './PowerUpType';
const { ccclass, property } = _decorator;

@ccclass('PowerUpSpawner')
export class PowerUpSpawner extends Component {
    @property(Prefab)
    pwPrefab: Prefab;

    private activePwUps: Map<PowerUpType, Node> = new Map();
    
    protected start(): void {
        GameManger.Instance.socketManager.on("SPAWN_POWER_UP", (data) => {
            const { pwType, x, y } = data;
            this.spawn(pwType, new Vec3(x, y, 0));
        });

        GameManger.Instance.socketManager.on("POWER_UP_REMOVED", (type: number) => {
            if(this.activePwUps.size == 0) return;
            
            const pwNode = this.activePwUps.get(type);
            if (pwNode) {
                pwNode.destroy();
                this.activePwUps.delete(type);
            }
        });
    }

    spawn(type, position) {
        if (this.activePwUps.has(type)) return;
        if (!this.pwPrefab) return;
        const pw = instantiate(this.pwPrefab);
        this.node.addChild(pw);
        pw.setPosition(position);

        this.activePwUps.set(type, pw);
    }
}


