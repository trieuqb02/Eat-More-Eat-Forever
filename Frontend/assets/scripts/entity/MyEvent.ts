import { Event } from 'cc';

export class MyEvent extends Event {
    constructor(name: string, bubbles?: boolean, detail?: any){
        super(name, bubbles);
        this.detail = detail;
    }
    public detail: any = null; 
}