import { _decorator, Color, Component, Game, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
import { GameManger } from './GameManger';
import { UICapture } from './UICapture';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    public static Instance: UIManager = null; // singleton

    @property(Label)
    scoreLabel: Label;
    @property(Prefab)
    scoreItemPrefab: Prefab = null;
    @property(Node)
    scoreTableParent: Node;

    @property(Label)
    timerLabel: Label;

    @property(Node)
    gameOverPanel: Node;

    @property(Node)
    captureNode:Node;

    private playerLabels: Map<String, Label> = new Map();
    private playerScores: Map<String, number> = new Map();

    @property(Label) gameOverResult: Label;
    @property(Label) gameOverYourScore: Label;
    @property(Node) gameOverRankingParent: Node;
    @property(Prefab) rankingItemPrefab: Prefab;

    protected onLoad() {
        if (UIManager.Instance === null) UIManager.Instance = this; // singleton
    }
    onDestroy() {
        if (UIManager.Instance === this) 
            UIManager.Instance = null;
    }

    protected start() {
        this.gameOverPanel.active = false;
    }

    setScore(score){
        this.scoreLabel.string = score;
    }

    updateScore(playerId, score) {
        this.playerScores.set(playerId, score);

        if (!this.playerLabels.has(playerId)) {
            const item = instantiate(this.scoreItemPrefab);
            const label = item.getComponent(Label);
            this.scoreTableParent.addChild(item);
            this.playerLabels.set(playerId, label);

            if (playerId === GameManger.Instance.playerId) {
                label.color = new Color(50, 255, 50); 
            }
        }

        const label = this.playerLabels.get(playerId);
        label.string = `${playerId.substring(0, 3)}: ${score}`;

        // sort
        const sortedPlayers = Array.from(this.playerScores.entries())
            .sort((a, b) => b[1] - a[1]);

        const itemHeight = 60;
        sortedPlayers.forEach(([id], index) => {
            const lbl = this.playerLabels.get(id);
            if (lbl && lbl.node) {
                const targetY = -index * itemHeight;
                tween(lbl.node)
                    .stop()
                    .to(0.8, { position: new Vec3(0, targetY, 0) }, { easing: 'quadOut' })
                    .start();
            }
        });
    }

    removePlayer(playerId) {
        const label = this.playerLabels.get(playerId);
        if (label && label.node) {
            label.node.destroy();
        }
        this.playerLabels.delete(playerId);
    }

    updateTimer(timer){
        this.timerLabel.string = `${timer}`;
    }

    displayGameOverPanel(){
        const myId = GameManger.Instance.playerId;
        const myScore = this.playerScores.get(myId) || 0;

        // Sort 
        const sorted = Array.from(this.playerScores.entries())
            .sort((a, b) => b[1] - a[1]);

        // check win
        const topId = sorted[0][0];
        const isWin = topId === myId;

        this.gameOverResult.string = isWin ? "YOU WIN!" : "YOU LOSE!";
        this.gameOverResult.color = isWin ? new Color(255, 215, 0) : new Color(255, 80, 80);

        this.gameOverYourScore.string = `Score: ${myScore}`;

        // Clear ranking
        this.gameOverRankingParent.removeAllChildren();

        sorted.forEach(([id, score], index) => {
            const item = instantiate(this.rankingItemPrefab);
            //const icon = item.getChildByName("Icon")?.getComponent(Sprite);
            const nameLabel = item.getChildByName("Name")?.getComponent(Label);
            const scoreLabel = item.getChildByName("Score")?.getComponent(Label);

            // Icon top 3
            // if (icon) {
            //     switch (index) {
            //         case 0: icon.spriteFrame = this.goldSprite; break;
            //         case 1: icon.spriteFrame = this.silverSprite; break;
            //         case 2: icon.spriteFrame = this.bronzeSprite; break;
            //         default: icon.node.active = false; break;
            //     }
            // }

            // name
            const nameStr = (id === myId) ? `${id.substring(0, 5)} (YOU)` : id.substring(0, 5);
            nameLabel.string = nameStr;
            scoreLabel.string = `${score}`;

            this.gameOverRankingParent.addChild(item);
        });

        this.gameOverPanel.active = true;
    }

    async screenShot(): Promise<string>{
        const captureComp = this.captureNode.getComponent(UICapture);
        const renderTexture = await captureComp.captureUINode(this.gameOverPanel);
        const base64Image = captureComp.renderTextureToBase64(renderTexture);
        return base64Image;
    }
}

