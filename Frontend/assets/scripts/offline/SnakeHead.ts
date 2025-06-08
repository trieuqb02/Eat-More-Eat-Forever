import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
} from "cc";
import { PlayerSnake } from "./PlayerSnake";
import { AISnake } from "./AISnake";
import { SnakeBody } from "./SnakeBody";
import { MyEvent } from "../entity/MyEvent";
const { ccclass, property } = _decorator;

@ccclass("SnakeHead")
export class SnakeHead extends Component {
  onLoad() {
    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onBeginContact(selfCollider: Collider2D,otherCollider: Collider2D,contact: IPhysics2DContact) {
    if (otherCollider.node.name == "Food") {
      otherCollider.node.destroy();
      let snake = this.node.parent;
      if (this.node.parent.name == "AISnake") {
        snake.getComponent(AISnake).grow(1);
      } else if (this.node.parent.name == "PlayerSnake") {
        snake.getComponent(PlayerSnake).grow(1);
      }
    } else if (otherCollider.node.name == "SnakeBody" &&selfCollider.node.parent.name == "PlayerSnake") {
      if (otherCollider.node.getComponent(SnakeBody).isAI) {
        if (otherCollider.node.getComponent(SnakeBody).isAI) {
          otherCollider.node.dispatchEvent(
            new MyEvent(
              "GAME-OVER",
              true,
              selfCollider.node.parent.getComponent(PlayerSnake)?.uuid ?? null
           )
          );
        }
      }
    } else if (otherCollider.node.name == "SnakeBody" && selfCollider.node.parent.name == "AISnake") {
      if (!otherCollider.node.getComponent(SnakeBody).isAI) {
        otherCollider.node.dispatchEvent(
          new MyEvent(
            "DESTROY",
            true,
            selfCollider.node.parent.getComponent(AISnake)?.uuid ?? null
          )
        );
      }
    } 
  }
}
