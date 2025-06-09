import { PowerUpType } from "./PowerUpType";

export interface IEffect {
    type: PowerUpType;
    duration: number;
    elapsed: number;
    update(deltaTime: number);
    onStart();
    onEnd();
}
