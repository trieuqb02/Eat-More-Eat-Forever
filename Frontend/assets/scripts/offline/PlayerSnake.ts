import { _decorator, input, Input, KeyCode, EventKeyboard, Collider2D, Contact2DType, IPhysics2DContact } from "cc";
import { BaseSnake } from "./BaseSnake";
import { Direction } from "./Direction";

const { ccclass } = _decorator;

@ccclass("PlayerSnake")
export class PlayerSnake extends BaseSnake {
  protected onEnable(): void {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  protected onDisable(): void {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  private onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.KEY_W:
      case KeyCode.ARROW_UP:
        this.updateDirection(Direction.Up);
        break;
      case KeyCode.KEY_S:
      case KeyCode.ARROW_DOWN:
        this.updateDirection(Direction.Down);
        break;
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
        this.updateDirection(Direction.Left);
        break;
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        this.updateDirection(Direction.Right);
        break;
    }
  }
}
