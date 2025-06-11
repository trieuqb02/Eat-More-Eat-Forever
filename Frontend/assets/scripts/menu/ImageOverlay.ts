import { _decorator, Component, Node, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ImageOverlay")
export class ImageOverlay extends Component {
  @property(Sprite)
  imageSprite: Sprite = null;

  show(spriteFrame: SpriteFrame) {
    this.imageSprite.spriteFrame = spriteFrame;
    this.node.active = true;
  }

  hide() {
    this.node.active = false;
  }
}
