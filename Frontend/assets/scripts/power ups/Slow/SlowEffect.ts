import { _decorator, Component, Node } from 'cc';
import { IEffect } from '../IEffect';
import { ISlowable } from './ISlowable';
const { ccclass, property } = _decorator;

@ccclass('SlowEffect')
export class SlowEffect implements IEffect {
    duration: number;
    elapsed = 0;
    name: string;
    speedSlowTimes: number;
    private target: ISlowable;

    constructor(duration: number, target: ISlowable, speedSlowTimes: number) {
        this.duration = duration;
        this.target = target;
        this.speedSlowTimes = speedSlowTimes;
    }

    onStart() {
        console.log("Start effect");
        //this.target.accelerateEffect.active = true;
        this.target.setSlowSpeed(true, this.speedSlowTimes)
    }

    onEnd() {
        console.log("End effect");
        //this.target.accelerateEffect.active = false;
        this.target.setSlowSpeed(false, 1/ this.speedSlowTimes);
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

