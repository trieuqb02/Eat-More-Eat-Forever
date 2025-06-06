import { _decorator, Color, Component, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
import { GameManger } from './GameManger';
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

    private playerLabels: Map<string, Label> = new Map();
    private playerScores: Map<string, number> = new Map();

    protected onLoad() {
        if (UIManager.Instance === null) UIManager.Instance = this; // singleton
    }
    onDestroy() {
        if (UIManager.Instance === this) 
            UIManager.Instance = null;
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
}

