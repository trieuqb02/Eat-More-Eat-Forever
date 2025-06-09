import { _decorator, Component, Node } from 'cc';
import { PowerUp } from './PowerUp';
import { IEffect } from './IEffect';
import { AccelerateEffect } from './Accelerate/AccelerateEffect';
import { SlowEffect } from './Slow/SlowEffect';
import { GameManger } from '../GameManger';
import { PowerUpType } from './PowerUpType';
const { ccclass, property } = _decorator;

@ccclass('MysteryBoxPW')
export class MysteryBoxPW extends PowerUp {
    powerUpType: PowerUpType = PowerUpType.MYSTERY;

    pwUpActive(target) {
        // GameManger.Instance.socketManager.emit("POWER_UP_COLLECTED", {
        //     playerId: this.playerId, 
        //     powerUpType: PowerUpType.MYSTERY
        // });
        // sellect a effect
        //const rand = Math.floor(Math.random() * 2);

        // let effect: IEffect;

        // switch (rand) {
        //     case 0:
        //         effect = new AccelerateEffect(this.duration, target, this.speedAccelerateTimes); 
        //         break;
        //     case 1:
        //         effect = new SlowEffect(this.duration, target, this.speedSlowTimes); 
        //         break;
        //     // case 2:
        //     //     effect = new ShieldEffect(this.duration, target); 
        //     //     break;
        // }

        // target.addEffect(effect);
        // this.scheduleOnce(()=>{
        //     this.node.destroy();
        // }, 0);
    }
}

