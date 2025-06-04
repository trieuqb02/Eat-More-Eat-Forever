import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { EntityType } from '../snake/EntityType';
import { GameManger } from '../GameManger';
import { Food } from './Food';
const { ccclass, property } = _decorator;

@ccclass('FoodSpawner')
export class FoodSpawner extends Component {
    public static Instance: FoodSpawner = null;

    @property({ type: [Prefab] })
    foodPrefabs: Prefab[] = [];

    private activeFoods: Map<EntityType, Node> = new Map();

    onLoad() {
        FoodSpawner.Instance = this;
        //this.spawnAllFoods();
    }

    protected start() {
        GameManger.Instance.socketManager.on("FOOD_REMOVED", (type: number) => {
            const foodNode = this.activeFoods.get(type);
            if (foodNode) {
                foodNode.destroy();
                this.activeFoods.delete(type);
            }
        });
        // socket
        GameManger.Instance.socketManager.on("SPAWN_FOOD", (data) => {
            const { type, x, y } = data;
            this.spawnFood(type, new Vec3(x, y, 0));
        });

        GameManger.Instance.socketManager.emit("FOOD_EATEN", {
            type: EntityType.BLUE
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

    // spawnFood(type, pos) {
    //     console.log("Spawn in client");
    //     //if (this.activeFoods.has(type)) return; // exist

    //     const prefab = this.foodPrefabs[type];
    //     if (!prefab) return;

    //     const food = instantiate(prefab);
    //     this.node.addChild(food);

    //     food.setPosition(pos);

    //     //this.activeFoods.set(type, food);
    // }

    // onFoodEat(type) {
    //     this.activeFoods.delete(type);
    //     this.scheduleOnce(() => this.spawnFood(type), 0.5);
    // }
}

