import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { EntityType } from '../snake/EntityType';
import { GameManger } from '../GameManger';
import { EventName } from '../utils/EventName';
const { ccclass, property } = _decorator;

@ccclass('FoodSpawner')
export class FoodSpawner extends Component {
    public static Instance: FoodSpawner = null;

    @property({ type: [Prefab] })
    foodPrefabs: Prefab[] = [];
    @property(Node)
    posSpawnParents: Node;

    private activeFoods: Map<EntityType, Node> = new Map();

    private FOOD_REMOVED = this.onFoodRemoved.bind(this);

    private SPAWN_FOOD = this.onSpawnFood.bind(this);

    onLoad() {
        FoodSpawner.Instance = this;
    }

    protected start() {
        GameManger.Instance.socketManager.on(EventName.FOOD_REMOVED, this.FOOD_REMOVED);

        GameManger.Instance.socketManager.on(EventName.SPAWN_FOOD, this.SPAWN_FOOD);
    }

    onFoodRemoved(type){
        const foodNode = this.activeFoods.get(type);
        if (foodNode) {
            foodNode.destroy();
            this.activeFoods.delete(type);
        }
    }

    onSpawnFood(data){
        const { foodType, x, y } = data;
        this.spawnFood(foodType, new Vec3(x, y, 0));

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



    protected onDestroy(): void {
        GameManger.Instance.socketManager.off(EventName.FOOD_REMOVED, this.FOOD_REMOVED);
        GameManger.Instance.socketManager.off(EventName.SPAWN_FOOD, this.SPAWN_FOOD);
    }
}

