import { _decorator, assetManager, Component, ImageAsset, Label, Node, Sprite, SpriteFrame, Texture2D } from 'cc';
import { IBaseComponent } from '../base/IBaseComponent';
import { LeaderBoard } from '../entity/LeaderBoard';
const { ccclass, property } = _decorator;

@ccclass('Leader_Board')
export class Leader_Board extends Component implements IBaseComponent {
    private roomPlayerId: string;
    private score: number;
    private namePlayer: string;
    private urlImage: string;

    init(data: LeaderBoard): void {
        this.roomPlayerId = data.roomPlayerId;
        this.namePlayer = data.name;
        this.score = data.score;
        this.urlImage = data.urlImage;
    }

    protected onLoad(): void {
        const image = this.node.getChildByName("Image").getComponent(Sprite);
        assetManager.loadRemote<ImageAsset>(this.urlImage, {ext: '.png'}, function (err, imageAsset) {
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            
            image.spriteFrame = spriteFrame;
        });
        this.node.getChildByName("Score").getComponent(Label).string = `Score: ${this.score}`;
        this.node.getChildByName("Name").getComponent(Label).string = `Name: ${this.namePlayer}`;
    }
}


