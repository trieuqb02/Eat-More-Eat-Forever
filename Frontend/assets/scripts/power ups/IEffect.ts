export interface IEffect {
    name: string;
    duration: number;
    elapsed: number;
    update(deltaTime: number);
    onStart();
    onEnd();
}
