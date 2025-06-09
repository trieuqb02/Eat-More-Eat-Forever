import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { GameManger } from '../GameManger';
const { ccclass, property } = _decorator;

@ccclass('PowerUpSpawner')
export class PowerUpSpawner extends Component {
    @property(Prefab)
    pwPrefab: Prefab;

    protected onLoad(): void {
        GameManger.Instance.socketManager.on("SPAWN_POWER_UP", (data) => {
            const { powerUpType, x, y } = data;

            const powerUpNode = instantiate(this.pwPrefab);
            this.node.addChild(powerUpNode);
            powerUpNode.setPosition(new Vec3(x, y, 0));
        });
    }
}


