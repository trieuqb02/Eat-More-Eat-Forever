import { _decorator, Component, Node } from "cc";
import { BaseSnake } from "./BaseSnake";
import { Direction } from "./Direction";
const { ccclass, property } = _decorator;

@ccclass("AISnake")
export class AISnake extends BaseSnake {
  private directions = [
    Direction.Right,
    Direction.Down,
    Direction.Left,
    Direction.Up,
  ];
  private currentDirIndex = 0;
  private timer = 0;
  private changeDirInterval = 1;

  protected update(dt: number): void {
    this.timer += dt;

    if (this.timer >= this.changeDirInterval) {
      this.timer = 0;
      this.updateDirection(this.directions[this.currentDirIndex]);
      this.currentDirIndex =
        (this.currentDirIndex + 1) % this.directions.length;
    }
  }
}
