import { _decorator, Component, Node } from 'cc';
import { SlowEffect } from './SlowEffect';
import { PowerUp } from '../PowerUp';
const { ccclass, property } = _decorator;

@ccclass('SlowPW')
export class SlowPW extends PowerUp {
    @property
    private duration: number = 5;
    @property
    private speedSlowTimes: number = 0.5;
    pwUpActive(target) {
        target.addEffect(new SlowEffect(this.duration, target, this.speedSlowTimes));
    }
}

