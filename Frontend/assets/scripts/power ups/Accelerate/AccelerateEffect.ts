import { _decorator, Component, Node } from 'cc';
import { IAcceleratable } from './IAcceleratable';
import { IEffect } from '../IEffect';
const { ccclass, property } = _decorator;

@ccclass('AccelerateEffect')
export class AccelerateEffect implements IEffect {
    duration: number;
    elapsed = 0;
    name: string;
    speedAccelerateTimes: number;
    private target: IAcceleratable;

    constructor(duration: number, target: IAcceleratable, speedAccelerateTimes: number) {
        this.duration = duration;
        this.target = target;
        this.speedAccelerateTimes = speedAccelerateTimes;
    }

    onStart() {
        console.log("Start effect");
        //this.target.accelerateEffect.active = true;
        this.target.setAccelerate(true, this.speedAccelerateTimes)
    }

    onEnd() {
        console.log("End effect");
        //this.target.accelerateEffect.active = false;
        this.target.setAccelerate(false, 1/ this.speedAccelerateTimes);
    }

    update(dt) {
        this.elapsed += dt;
        if (this.elapsed >= this.duration) {
            this.onEnd();
            return true; // Effect done
        }
        return false; // Still active
    }
}

