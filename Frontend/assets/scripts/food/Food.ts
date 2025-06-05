import { _decorator, Component, Enum } from 'cc';
import { EntityType } from '../snake/SnakeCtrl';
import { FoodSpawner } from './FoodSpawner';
const { ccclass, property } = _decorator;

@ccclass('Food')
export class Food extends Component {
    @property({ type: Enum(EntityType) })
    foodType: EntityType = EntityType.RED;

    @property
    private _scoreAmount: number = 10;
    
    public get scoreAmount() { return this._scoreAmount; }
    

    eat() {
        // continue spawn after eat
        this.scheduleOnce(()=>{
            this.node.destroy();
        })
        FoodSpawner.Instance.onFoodEat(this.foodType);
    }
}

