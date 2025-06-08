import {
  _decorator,
  Component,
  director,
  instantiate,
  Label,
  Node,
  Prefab,
  randomRangeInt,
  UITransform,
  Vec3,
} from "cc";
import { IBaseComponent } from "../base/IBaseComponent";
import { Food } from "./Food";
import { GameConfig } from "./GameConfig";
import { PlayerSnake } from "./PlayerSnake";
import { AISnake } from "./AISnake";
import { COLORS } from "./BaseSnake";
import { MyEvent } from "../entity/MyEvent";
import { SceneName } from "../utils/SceneName";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component implements IBaseComponent {
  @property(Node)
  private gameArea: Node = null;

  @property(Prefab)
  private foodPrefab: Prefab = null;

  @property(Prefab)
  private playerSnakePrefab: Prefab = null;

  @property(Prefab)
  private aiSnakePrefab: Prefab = null;

  @property(Node)
  private resultPanel: Node = null;

  @property
  private defaultAI: number = 0;

  private playerSnake: PlayerSnake;

  private aiSnakes: AISnake[] = [];

  init(data?: any): void {
    const size = this.gameArea.getComponent(UITransform).contentSize;

    GameConfig.minX = -size.width / 2;
    GameConfig.maxX = size.width / 2;
    GameConfig.minY = -size.height / 2;
    GameConfig.maxY = size.height / 2;
  }

  protected onLoad(): void {
    this.node.on("DESTROY", (event: MyEvent) => {
      const snake = this.aiSnakes.find((snake) => event.detail === snake.uuid);
      if (snake) {
        snake.node.destroy();
        this.aiSnakes = this.aiSnakes.filter((s) => s.uuid !== snake.uuid);
      }
      if (this.aiSnakes.length == 0) {
        this.showResultPanel("Win");
        this.unscheduleAllCallbacks();
      }
      event.propagationStopped = true;
    });

    this.node.on("GAME-OVER", (event: MyEvent) => {
      this.showResultPanel("LOST");
      this.unscheduleAllCallbacks();
      event.propagationStopped = true;
    });
  }

  protected start(): void {
    this.init();
    this.spawnFood();
    this.schedule(() => this.spawnFood(), 0.5);

    this.spawnAISnake(this.defaultAI);
    this.spawnPlayerSnake();
    this.schedule(() => {
      this.playerSnake.move();
      this.aiSnakes.forEach((ai) => ai.move());
    }, 0.2);
  }

  spawnFood() {
    const food = instantiate(this.foodPrefab);

    const randomX = randomRangeInt(GameConfig.minX, GameConfig.maxX);
    const randomY = randomRangeInt(GameConfig.minY, GameConfig.maxY);
    const pos = new Vec3(randomX, randomY, 0);
    const foodComp = food.getComponent(Food);
    foodComp?.init(pos);

    this.gameArea.addChild(food);
  }

  private spawnPlayerSnake() {
    const snakeNode = instantiate(this.playerSnakePrefab);
    this.gameArea.addChild(snakeNode);

    const pos = new Vec3(0, 0, 0);
    const color = COLORS[3];
    this.playerSnake = snakeNode.getComponent(PlayerSnake);
    this.playerSnake.init({
      pos: pos,
      isAI: false,
      color: color,
    });
  }

  private spawnAISnake(count: number): void {
    const positions: Vec3[] = [];

    for (let i = 0; i < count; i++) {
      let x, y;
      let tries = 0;
      do {
        x =
          Math.floor(Math.random() * (GameConfig.maxX - GameConfig.minX)) +
          GameConfig.minX;
        y =
          Math.floor(Math.random() * (GameConfig.maxY - GameConfig.minY)) +
          GameConfig.minY;
        tries++;
      } while (
        positions.some((pos) => pos.subtract3f(x, y, 0).length() < 50) &&
        tries < 10
      );

      const pos = new Vec3(x, y, 0);
      positions.push(pos);

      const aiNode = instantiate(this.aiSnakePrefab);

      this.gameArea.addChild(aiNode);
      const aiSnake = aiNode.getComponent(AISnake);
      const color = COLORS[i];
      aiSnake.init({
        pos: pos,
        isAI: true,
        color: color,
      });
      this.aiSnakes.push(aiSnake);
    }
  }

  onDisable() {
    this.unscheduleAllCallbacks();
  }

  clickBack() {
    director.loadScene(SceneName.MENU);
  }

  clickReplay() {
    director.loadScene(SceneName.PLAY_OFFLINE);
    this.resultPanel.active = false;
  }

  showResultPanel(mess: string) {
    this.resultPanel.active = true;
    this.resultPanel.getChildByName("Title").getComponent(Label).string = mess;
  }
}
