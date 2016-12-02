
import { GGraph, GNode, GArc,Logger } from './graph';

var nodes = [
    new GNode('A'),
    new GNode('B'),
    new GNode('C'),
    new GNode('D'),
    new GNode('E'),
    new GNode('F'),
    new GNode('G'),
];


var arcs = [
    new GArc('A', '1', 'E', '5'),
    new GArc('A', '2', 'F', '1'),
    new GArc('A', '3', 'B', '1'),
    new GArc('B', '2', 'F', '3'),
    new GArc('B', '3', 'E', '3'),
    new GArc('B', '4', 'G', '4'),
    new GArc('B', '5', 'C', '1'),
    new GArc('C', '2', 'G', '2'),
    new GArc('C', '3', 'D', '2'),
    new GArc('D', '1', 'E', '1'),
    new GArc('D', '3', 'G', '2'),
    new GArc('E', '2', 'G', '1'),
    new GArc('E', '4', 'F', '2'),
];


// var logger = new Logger();
// export class Graph {

//     private treeFrame: Element;
//     private _switches: Array<Switch>;
//     private _links: Array<Link>;

//     constructor(treeFrame: Element, switches?: Array<Switch>, links?: Array<Link>) {
//         this.treeFrame = treeFrame;
//         this._switches = switches || [];
//         this._links = links || [];
//     }
//     public init(): void {
//         this.buildGraph()
//     }

//     public buildGraph(): void {
//         this.buildLinks();
//     }
//     private buildLinks(): void {
//         for (let link in this._links) {

//         }
//     }

//     public addSwitch(newSwitch: Switch): void {
//         if (this._switches.indexOf(newSwitch) !== -1) {
//             throw Error("switch name all ready exists");
//         }
//         ///add related links
//         this._links.forEach((l) => {
//             if (l.source === newSwitch.name || l.dest === newSwitch.name) {
//                 newSwitch.addLink(l);
//             }
//         });
//         // add the switch
//         this._switches.push(newSwitch);
//         SwitchMap.addSwitch(newSwitch.name, newSwitch);
//     }

//     public addLink(newLink: Link): void {
//         for (let s of this._switches) {
//             if (newLink.source === s.name || newLink.dest === s.name) {
//                 s.addLink(newLink);
//             }
//         }
//         this._links.push(newLink);
       
//     }

// }

// export class Switch {

//     constructor(name: string) {
//         this._name = name;
//     }
//     private _name: string;
//     public get name(): string {
//         return this._name;
//     }

//     private _links: Array<Link>;
//     public get links(): Array<Link> {
//         return this._links;
//     }

//     public addLink(link: Link): void {
//         this._links = this._links || [];
//         this._links.push(link);
//     }

//     public removeLink(link: Link): void {
//         let index = this._links.indexOf(link);
//         index > -1 && this._links.splice(index, 1);
//     }


//     private _message: Message;
//     public get message(): Message {
//         return this._message;
//     }
//     public set message(v: Message) {
//         this._message = v;
//     }

//     public broadcast(): void {
//         this.links.forEach(
//             (link: Link) => {
//                 if (link.isActive) {
//                     let s = SwitchMap.getSwitch(link.dest);
//                     s.reactToMessage(this.message);
//                 }
//             });
//     }

//     private connectionIsAvailable(owner: string): boolean {
//         return true;
//     }

//     public reactToMessage(message: Message): void {
//         if (!this.connectionIsAvailable(message.owner) || this._name === message.owner) { return; }

//         if (this.message.root.localeCompare(message.root) > 0) {
//             this.message.root = message.root;
//             this.message.steps = message.steps + 1;
//         }
//     }

// }

// export class SwitchMap {
//     public static map: Map<string, Switch>;
//     public static addSwitch(key: string, value: Switch): void {
//         this.map.set(key, value);
//     }
//     public static getSwitch(key: string): Switch {
//         return this.map.get(key);
//     }
// }




// export class Link {

//     public source: string;
//     public dest: string;
//     public isActive: boolean;

// }

// export class Message {


//     private _owner: string;
//     private _root: string;
//     private _steps: string;

//     public get owner(): string {
//         return this._owner;
//     }
//     public set owner(v: string) {
//         this._owner = v;
//     }

//     public get root(): string {
//         return this._root;
//     }
//     public set root(v: string) {
//         this._root = v;
//     }
//     public get steps(): string {
//         return this._steps;
//     }
//     public set steps(v: string) {
//         this._steps = v;
//     }



// }

var g = new GGraph(document.getElementById('tree-frame'), nodes, arcs);







