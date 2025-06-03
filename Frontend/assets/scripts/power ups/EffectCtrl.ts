import { _decorator, Component, Node } from 'cc';
import { IEffect } from './IEffect';
const { ccclass, property } = _decorator;

@ccclass('EffectCtrl')
export class EffectCtrl {
    private effects: IEffect[] = [];
    private target;

    constructor(target) {
        this.target = target;
    }

    update(dt: number) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            const done = effect.update(dt);
            if (done) {
                this.effects.splice(i, 1);
            }
        }
    }

    addEffect(effect: IEffect) {
        const existing = this.effects.find(e => e.name === effect.name);
        if (existing) {
            existing.duration = Math.max(existing.duration, effect.duration);
            existing.elapsed = 0; // reset time
        } else {
            effect.onStart();
            this.effects.push(effect);
        }
    }
}


