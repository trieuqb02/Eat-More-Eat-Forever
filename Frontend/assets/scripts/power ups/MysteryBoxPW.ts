import { _decorator, Component, Node } from 'cc';
import { PowerUp } from './PowerUp';
import { IEffect } from './IEffect';
import { AccelerateEffect } from './Accelerate/AccelerateEffect';
import { SlowEffect } from './Slow/SlowEffect';
import { GameManger } from '../GameManger';
const { ccclass, property } = _decorator;

@ccclass('MysteryBoxPW')
export class MysteryBoxPW extends PowerUp {
    @property
    private duration: number = 5;

    // @property
    // private speedAccelerateTimes: number = 2;
    // @property
    // private speedSlowTimes: number = 0.5;

    pwUpActive(target) {
        // GameManger.Instance.socketManager.emit("POWER_UP_COLLECTED", {
        //     playerId: this.playerId, 
        //     powerUpType: PowerUpType.MYSTERY
        // });
        // // sellect a effect
        // const rand = Math.floor(Math.random() * 2);

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

