import { _decorator, Component, Node } from 'cc';
import { AccelerateEffect } from './AccelerateEffect';
import { PowerUp } from '../PowerUp';
const { ccclass, property } = _decorator;

@ccclass('AcceleratePW')
export class AcceleratePW extends PowerUp {
    @property
    private duration: number = 5;
    @property
    private speedAccelerateTimes: number = 2;
    pwUpActive(target) {
        target.addEffect(new AccelerateEffect(this.duration, target, this.speedAccelerateTimes));
    }
}

