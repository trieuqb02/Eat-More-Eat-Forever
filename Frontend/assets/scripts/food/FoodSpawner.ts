import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { EntityType } from '../snake/SnakeCtrl';
const { ccclass, property } = _decorator;

@ccclass('FoodSpawner')
export class FoodSpawner extends Component {
    public static Instance: FoodSpawner = null;

    @property({ type: [Prefab] })
    foodPrefabs: Prefab[] = [];

    private activeFoods: Map<EntityType, Node> = new Map();

    onLoad() {
        FoodSpawner.Instance = this;
        this.spawnAllFoods();
    }

    spawnAllFoods() {
        for (let i = 0; i < 3; i++) {
            this.spawnFood(i as EntityType);
        }
    }

    spawnFood(type) {
        if (this.activeFoods.has(type)) return; // exist

        const prefab = this.foodPrefabs[type];
        if (!prefab) return;

        const food = instantiate(prefab);
        this.node.addChild(food);

        const randomPos = new Vec3(
            Math.random() * 600 - 300,
            Math.random() * 400 - 200,
            0
        );
        food.setPosition(randomPos);

        this.activeFoods.set(type, food);
    }

    onFoodEat(type) {
        this.activeFoods.delete(type);
        this.scheduleOnce(() => this.spawnFood(type), 0.5);
    }
}

