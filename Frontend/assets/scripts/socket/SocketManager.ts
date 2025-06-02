import { _decorator, Component, Node } from 'cc';
import { Socket } from 'socket.io-client';
const { ccclass, property } = _decorator;

@ccclass('SocketManager')
export class SocketManager extends Component {
    private socket: Socket;

    start() {
        this.initSocket();
    }

    initSocket() {
        this.socket = (window as any).io('http://localhost:3000');
        console.log(this.socket)

        this.socket.on('connect', () => {
            console.log('Connected:', this.socket.id);
        });

        this.socket.emit("chat", "world");

        this.socket.on("chat", (val) => {
            console.log(val)
        });

    }
}

