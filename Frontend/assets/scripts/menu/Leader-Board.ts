import { _decorator, assetManager, Component, ImageAsset, Label, Node, Sprite, SpriteFrame, Texture2D } from 'cc';
import { IBaseComponent } from '../base/IBaseComponent';
import { LeaderBoard } from '../entity/LeaderBoard';
import { ImageOverlay } from './ImageOverlay';
const { ccclass, property } = _decorator;

@ccclass('Leader_Board')
export class Leader_Board extends Component implements IBaseComponent {
    @property(ImageOverlay)
    private imageOverlay: ImageOverlay = null;

    private roomPlayerId: string;
    private score: number;
    private namePlayer: string;
    private urlImage: string;

    private loadedSpriteFrame: SpriteFrame = null;

    init(data: LeaderBoard): void {
        this.roomPlayerId = data.roomPlayerId;
        this.namePlayer = data.name;
        this.score = data.score;
        this.urlImage = data.urlImage;
    }

    setOverlay(overlayParent: ImageOverlay) {
        this.imageOverlay = overlayParent;
    }

    protected onLoad(): void {
        const image = this.node.getChildByName("Image").getComponent(Sprite);
        assetManager.loadRemote<ImageAsset>(this.urlImage, { ext: '.png' }, (err, imageAsset) => {
        if (err) {
            console.error('Load image failed:', err);
            return;
        }

        const spriteFrame = new SpriteFrame();
        const texture = new Texture2D();
        texture.image = imageAsset;
        spriteFrame.texture = texture;

        image.spriteFrame = spriteFrame;
        this.loadedSpriteFrame = spriteFrame;
        this.setupZoomEvent();
    });
        this.node.getChildByName("Score").getComponent(Label).string = `Score: ${this.score}`;
        this.node.getChildByName("Name").getComponent(Label).string = `Name: ${this.namePlayer}`;
    }

    private setupZoomEvent(): void {
        const imageNode = this.node.getChildByName("Image");
        imageNode.on(Node.EventType.TOUCH_END, () => {
            if (!this.loadedSpriteFrame) return;
            const overlay = this.imageOverlay.getComponent(ImageOverlay);
            overlay.show(this.loadedSpriteFrame);
        }, this);
    }
}


