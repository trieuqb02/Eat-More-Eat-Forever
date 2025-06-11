import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { EntityType } from '../snake/EntityType';
import { GameManger } from '../GameManger';
const { ccclass, property } = _decorator;

@ccclass('FoodSpawner')
export class FoodSpawner extends Component {
    public static Instance: FoodSpawner = null;

    @property({ type: [Prefab] })
    foodPrefabs: Prefab[] = [];
    @property(Node)
    posSpawnParents: Node;

    private activeFoods: Map<EntityType, Node> = new Map();

    onLoad() {
        FoodSpawner.Instance = this;
    }

    protected start() {
        GameManger.Instance.socketManager.on("FOOD_REMOVED", (type: number) => {
            const foodNode = this.activeFoods.get(type);
            if (foodNode) {
                foodNode.destroy();
                this.activeFoods.delete(type);
            }
        });

        GameManger.Instance.socketManager.on("SPAWN_FOOD", (data) => {
            const { foodType, x, y } = data;
            const pos = new Vec3(x, y, 0);
            this.spawnFood(foodType, pos);
        });

        const spawnPoints = this.posSpawnParents.children.map(node => {
            return { x: node.position.x, y: node.position.y };
        });

        GameManger.Instance.socketManager.emit("SEND_SPAWN_POSITIONS", {
            roomId: GameManger.Instance.roomId,
            spawnPositions: spawnPoints
        });
    }

    spawnFood(type, position) {
        if (this.activeFoods.has(type)) return;
        const prefab = this.foodPrefabs[type];
        if (!prefab) return;
        const food = instantiate(prefab);
        this.node.addChild(food);
        food.setPosition(position);

        this.activeFoods.set(type, food);
    }
}

