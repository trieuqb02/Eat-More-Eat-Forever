import { _decorator, Component, Node } from 'cc';
import { SlowEffect } from './SlowEffect';
import { PowerUp } from '../PowerUp';
import { PowerUpType } from '../PowerUpType';
const { ccclass, property } = _decorator;

@ccclass('SlowPW')
export class SlowPW extends PowerUp {
    powerUpType: PowerUpType.SLOW;
    pwUpActive(target) {
        target.addEffect(new SlowEffect(this.duration, target));
    }
}

