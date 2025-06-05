import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFollowing')
export class CameraFollowing extends Component {
    @property(Node)
    target: Node;
    @property(Vec3)
    private offset: Vec3 = new Vec3(5, 5, 0); 

    private _currentPos: Vec3 = new Vec3();
    private _targetPos: Vec3 = new Vec3();

    @property
    private speed: number = 5;  

    protected update(dt) {
        if (!this.target) return;

        Vec3.add(this._targetPos, this.target.position, this.offset);
        Vec3.lerp(this._currentPos, this.node.position, this._targetPos, dt * this.speed);

        this.node.setPosition(this._currentPos);
    }
}

