import { _decorator, BoxCollider2D, Component, director, instantiate, Layers, Node, Prefab, Size, Vec3 } from 'cc';
import { EntityType } from '../snake/EntityType';
import { GameManger } from '../GameManger';
const { ccclass, property } = _decorator;

@ccclass('FoodSpawner')
export class FoodSpawner extends Component {
    public static Instance: FoodSpawner = null;

    @property({ type: [Prefab] })
    foodPrefabs: Prefab[] = [];

    @property(Prefab)
    testCollidePrefab: Prefab

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
            this.checkSpawnFoodPosition(pos, (valid) => {
                if (valid) {
                    this.spawnFood(foodType, pos);
                } else {
                    GameManger.Instance.socketManager.emit("SPAWN_FOOD", {
                        foodType,
                        roomId: GameManger.Instance.roomId,
                    });
                }
            });
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

    checkSpawnFoodPosition(pos: Vec3, callback: (valid: boolean) => void) {
        const testNode = instantiate(this.testCollidePrefab);
        this.node.addChild(testNode);
        testNode.setPosition(pos);

        testNode.once('COLLIDE_RESULT', (isCollide: boolean) => {
            callback(!isCollide); 
        });
    }

    // trySpawnFoodWithValidation(type, pos, maxAttempts: number = 10) {
    //     const trySpawn = (attempt: number) => {
    //         if (attempt >= maxAttempts) {
    //             console.warn("Failed to spawn food");
    //             return;
    //         }

    //         this.checkSpawnFoodPosition(pos, (valid) => {
    //             if (valid) {
    //                 this.spawnFood(type, pos);
    //             } else {
    //                 trySpawn(attempt + 1);
    //             }
    //         });
    //     };

    //     trySpawn(0);
    // }

}

