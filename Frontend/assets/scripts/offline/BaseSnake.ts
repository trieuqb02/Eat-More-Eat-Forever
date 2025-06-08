import {
  _decorator,
  Component,
  Node,
  Prefab,
  instantiate,
  Vec3,
  Color,
  Sprite,
  RigidBody2D,
  ERigidBody2DType,
  BoxCollider2D,
} from "cc";
import { IBaseComponent } from "../base/IBaseComponent";
import { Direction } from "./Direction";
import { SnakeBody } from "./SnakeBody";
const { ccclass, property } = _decorator;

export type Snake = {
  pos: Vec3;
  isAI: boolean;
  color: Color;
};

export const COLORS: Color[] = [
  new Color(255, 0, 0),
  new Color(0, 255, 0),
  new Color(0, 0, 255),
  new Color(255, 255, 0),
];

@ccclass("BaseSnake")
export class BaseSnake extends Component implements IBaseComponent {
  @property(Prefab)
  private snakeHead: Prefab = null;

  @property(Prefab)
  private snakeBody: Prefab = null;

  @property()
  private defaultBody: number = 0;

  protected direction: Direction = Direction.Right;
  protected moveStep = 20;
  protected bodyParts: Node[] = [];

  init(data?: Snake): void {
    this.bodyParts = [];
    const head = instantiate(this.snakeHead);
    head.setPosition(data.pos);
    head.getComponent(Sprite).color = data.color;
    this.node.addChild(head);
    this.bodyParts.push(head);

    this.grow(this.defaultBody, data.isAI);
  }

  updateDirection(newDir: Direction) {
    const invalid =
      (this.direction === Direction.Left && newDir === Direction.Right) ||
      (this.direction === Direction.Right && newDir === Direction.Left) ||
      (this.direction === Direction.Up && newDir === Direction.Down) ||
      (this.direction === Direction.Down && newDir === Direction.Up);
    if (!invalid) {
      this.direction = newDir;
    }
  }

  move() {
    if (this.bodyParts.length === 0) return;

    const prevPositions = this.bodyParts.map((p) => p.getPosition().clone());

    const head = this.bodyParts[0];
    const newPos = head.getPosition().clone();

    switch (this.direction) {
      case Direction.Up:
        newPos.y += this.moveStep;
        break;
      case Direction.Down:
        newPos.y -= this.moveStep;
        break;
      case Direction.Left:
        newPos.x -= this.moveStep;
        break;
      case Direction.Right:
        newPos.x += this.moveStep;
        break;
    }

    head.setPosition(newPos);

    for (let i = 1; i < this.bodyParts.length; i++) {
      this.bodyParts[i].setPosition(prevPositions[i - 1]);
    }
  }

  grow(amount: number = 1, isAI: boolean = false) {
    for (let i = 0; i < amount; i++) {
      const last = this.bodyParts[this.bodyParts.length - 1];
      const newBody = instantiate(this.snakeBody);
      newBody.setPosition(last.getPosition().clone());
      this.node.addChild(newBody);
      const bodyComp = newBody.getComponent(SnakeBody);
      if (isAI) {
        bodyComp.isAI = isAI;
      }
      bodyComp.init();

      this.bodyParts.push(newBody);
    }
  }

  getHead(): Node {
    return this.bodyParts[0];
  }

  getBodyParts(): Node[] {
    return this.bodyParts;
  }
}
