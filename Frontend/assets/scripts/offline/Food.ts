import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, tween, Vec3 } from "cc";
import { IBaseComponent } from "../base/IBaseComponent";
const { ccclass, property } = _decorator;

@ccclass("Food")
export class Food extends Component implements IBaseComponent {
  init(data?: any): void {
    this.node.setPosition(data);
    this.playScaleEffect();
  }

  playScaleEffect() {
    tween(this.node)
      .to(0.5, { scale: new Vec3(1.2, 1.2, 1.2) })
      .to(0.5, { scale: new Vec3(1, 1, 1) })
      .union()
      .repeatForever()
      .start();
  }
}
