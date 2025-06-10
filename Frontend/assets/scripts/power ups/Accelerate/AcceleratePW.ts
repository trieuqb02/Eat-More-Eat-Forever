import { _decorator, Component, Node } from 'cc';
import { AccelerateEffect } from './AccelerateEffect';
import { PowerUp } from '../PowerUp';
import { PowerUpType } from '../PowerUpType';
const { ccclass, property } = _decorator;

@ccclass('AcceleratePW')
export class AcceleratePW extends PowerUp {
    powerUpType: PowerUpType = PowerUpType.ACCELERATE;
    pwUpActive(target) {
        target.addEffect(new AccelerateEffect(this.duration, target));
    }
}

