import {
  _decorator,
  BoxCollider2D,
  Component,
  ERigidBody2DType,
  Node,
  RigidBody2D,
  UITransform,
} from "cc";
import { IBaseComponent } from "../base/IBaseComponent";
const { ccclass, property } = _decorator;

@ccclass("SnakeBody")
export class SnakeBody extends Component implements IBaseComponent {
  @property()
  isAI: boolean = false;

  init(data?: any): void {
    setTimeout(() => {
      const rigid = this.node.addComponent(RigidBody2D);
      rigid.type = ERigidBody2DType.Static;

      const collider = this.node.addComponent(BoxCollider2D);
      const ui = this.node.getComponent(UITransform);
      const width = ui.contentSize.width;
      const height = ui.contentSize.height;

      collider.size.set(width, height);

      collider.apply();
    }, 0);
  }
}
