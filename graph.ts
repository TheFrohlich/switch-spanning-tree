export class Logger {
    private view: HTMLElement;
    private counter: number
    constructor() {
        this.view = document.getElementById('loggerView');
        this.counter = 1;
    }
    log(message) {
        this.view.innerText += `\n${this.counter}. ${message}`;
        this.counter++;
    }
    clear(): void {
        this.view.innerText = '';
        this.counter = 0;
    }
    spacer():void{
        this.view.innerText +='\n--------------------------------------------------------------------------------';
    }
}

var logger = new Logger();

export class NodesMap {
    public static map: Map<string, GNode> = new Map();
}
export class GGraph {
    public mainElement: Element;
    public nodes: Array<GNode>
    public arcsList: Array<GArc>
    constructor(mainElement, nodesList, arcsList) {
        this.mainElement = mainElement;
        this.initArcs(arcsList);
        this.initNodes(nodesList);
        this.generateGraph();
    }

    initNodes(nodesList) {
        this.nodes = [];
        for (var node of nodesList) {
            var n = document.createElement('div');
            n.setAttribute('title', node.name);
            n.setAttribute('class', `node node-${node.name}`);
            n.innerHTML = `<span>${node.name}</span>`;
            node.element = n;
            node.arcs = this.getNodeArcs(node.name);
            node.setDefaultMessage();
            this.nodes.push(node);
            NodesMap.map.set(node.name, node);
            this.mainElement.appendChild(n);
        }
    };

    initArcs(arcsList) {
        var _this = this;
        _this.arcsList = arcsList;
        for (var arc of arcsList) {
            this.mainElement.appendChild(arc.element);
            arc.callBack = () => {
                this.resetGraph()
                this.generateGraph();
            };

        }
    };
    private resetGraph(): void {
        for (let a of this.arcsList) {
            a.cleanMarkTree();
        }
    }
    getStartingNode(activeNodes: Array<GNode>): GNode {
        let node = activeNodes.sort((a, b) => {
            let i = 0;
            while (a.name.length > i && b.name.length > i) {
                let res = a.name.charCodeAt(i) - b.name.charCodeAt(i);
                ++i;
                if (res !== 0) {
                    return res;
                }
            }
            return 0;
        });
        return node[0];
    }
    generateGraph(): void {
        let activeLinks = this.getWorkingLinks();
        let activeNodes = this.getActiveNodes();
        //select starting node
        let root = this.getStartingNode(activeNodes);
        logger.clear();
        logger.log(`root is set to ${root.name}`);

        for (let node of activeNodes) { node.setDefaultMessage(); }

        while (!this.isGraphReady(root.name, activeNodes)) {
            for (let node of activeNodes) {
                node.emit()
            }
        }
        logger.log('graph is ready');

        for (let node of activeNodes) {
            logger.log(node.message.toString2());
            let arcName = node.message.getArcName();
            let arc = activeLinks.get(arcName);
            arc && arc.markInTree();
        }


    }
    private isGraphReady(root: string, activeNodes: Array<GNode>): boolean {
        let res = true;
        for (let n of activeNodes) {
            res = root === n.message.root;
        }
        return res;
    }

    getNodeArcs(nodeName): Array<GArc> {
        var nodeArcs = new Array<GArc>();
        for (var arc of this.arcsList) {
            arc.name.includes(nodeName) && nodeArcs.push(arc);
        }
        //  nodeArcs.sort((a,b) => {return a.name.localeCompare(b.name)});
        return nodeArcs;
    };

    getActiveNodes(): Array<GNode> {
        var result = [];
        for (var node of this.nodes) {
            node.isActive() && result.push(node);
        }
        return result;
    };

    getWorkingLinks(): Map<string, GArc> {
        let res = new Map();
        for (let arc of this.arcsList) {
            arc.isActive && res.set(arc.name, arc);
        }
        return res;
    };


}



export class GNode {
    public name: string;
    public arcs: Array<GArc>;
    public element: Element;
    private root: string;
    public message: Message;
    constructor(name) {
        this.name = name;
        this.arcs = [];
        this.element = undefined;
        this.root = this.name;

    }
    public isActive(): boolean {
        var active = false;
        for (var arc of this.arcs) {
            active = active || arc.isActive;
        }
        return active;
    }

    public emit(): void {
        for (let arc of this.arcs) {
            arc.isActive && arc.emit(this.message);
        }
    }
    public getMessage():Message{
        return this.message;
    }
    public handleIncomingsMessage(incomingMessage: Message): void {
        if (incomingMessage.source == this.name) { throw Error('message sand to self !!'); }

        let innerMessage = this.message;
        logger.log(`innerMessage ${innerMessage.toString2()}`);
        logger.log(`incomingMessage ${incomingMessage.toString2()}`)

        let rootCompressionResult = this.message.root.localeCompare(incomingMessage.root);
        // if the this root is younger
        if (rootCompressionResult === 1) {
            innerMessage.root = incomingMessage.root;
            innerMessage.steps = incomingMessage.steps + 1;
            innerMessage.connector = incomingMessage.source;
        }
        if (rootCompressionResult === 0) {
            let stepsCompressionResult = this.compareNumbers(innerMessage.steps, incomingMessage.steps);
            if (stepsCompressionResult > 0) {
                innerMessage.connector = incomingMessage.source;
                innerMessage.steps = incomingMessage.steps + 1;
            }
            if (stepsCompressionResult === 0) {
                let connectorComparisonResult = innerMessage.connector.localeCompare(incomingMessage.connector);
                if (connectorComparisonResult === 1) {
                    innerMessage.connector = incomingMessage.connector;
                }
            }
        }
        if (rootCompressionResult < 1) {
        }
        logger.log(`Node ${this.name} message updated to ${innerMessage.toString2()}`);
        logger.spacer();

    }
    private compareNumbers(num1: number, num2: number): number {
        let r = num1 - num2;
        if (r > 0) {
            return 1;
        }
        if (r < 0) {
            return -1;
        }
        return 0;
    }
    public setDefaultMessage(): void {
        this.message = new Message(this.name, this.name, 0, null);
    }
};

export class Message {


    constructor(public source: string, public root: string, public steps: number, public connector: string) {

    }
    public toString2(): string {
        let an = this.getArcName();
        return `ArcName: ${an} Source: ${this.source}, Root: ${this.root}, Steps: ${this.steps}, Connector: ${this.connector || 'Empty'}.`;
    }
    public getArcName(): string {
        if (this.connector === 'Empty') { return null; }
        let r = this.source.localeCompare(this.connector);
        return r === -1 ? this.source + this.connector : this.connector + this.source;
    }
    
}

export class GArc {
    public name: string;
    public start: string;
    public startEntryNumber: string;
    public startInterface: Element;
    public end: string;
    public endEntryNumber: string;
    public endInterface: Element;
    public isActive: boolean
    public element: Element;
    public callBack: Function;

    public logger: Logger;
    constructor(start, startEntryNumber, end, endEntryNumber) {
        this.name = start + end;
        this.start = start;
        this.startEntryNumber = startEntryNumber;
        this.end = end;
        this.endEntryNumber = endEntryNumber;
        this.isActive = true;
        this.startInterface = undefined;
        this.endInterface = undefined;
        this.element = this.bootstrapArc(start + startEntryNumber, end + endEntryNumber);
        this.logger = new Logger();
        this.callBack = undefined;
    };

    public emit(message: Message): void {
        let receivingNode = message.source === this.end ? NodesMap.map.get(this.start) : NodesMap.map.get(this.end);
        receivingNode.handleIncomingsMessage(message);
    };

    bootstrapArc(i1Name, i2Name) {
        var div = document.createElement('div');
        this.startInterface = this.createInterface(i1Name);
        this.endInterface = this.createInterface(i2Name, true)
        div.appendChild(this.startInterface);
        div.appendChild(this.endInterface);

        div.setAttribute('title', this.name);
        div.setAttribute('class', `arc arc-${this.name}`);
        return div;
    };

    createInterface(name, isEnd = false) {
        var _this = this;
        var i = document.createElement("div");
        i.setAttribute('class', 'interface');
        i.setAttribute('style', `
            left:${isEnd ? '90%' : '0%'};
        `);
        i.setAttribute('id', name);
        i.innerHTML += name;
        i.addEventListener('click', (sender) => {
            var target = sender.currentTarget;
            sender.stopPropagation();
            var postEvent = (target as Element).classList.contains('error') ?
                () => {
                    (target as Element).classList.remove('error');
                    if (!_this.startInterface.classList.contains('error') && !_this.endInterface.classList.contains('error')) {
                        _this.element.classList.remove('error');
                        _this.isActive = true;
                    }
                    logger.log((target as Element).id + " is enabled");
                } :
                () => {
                    (target as Element).classList.add('error');
                    if (_this.startInterface.classList.contains('error') || _this.endInterface.classList.contains('error')) {
                        _this.element.classList.add('error');
                        _this.isActive = false;
                    }
                    logger.log((target as Element).id + " is disabled");
                }
            postEvent();
            _this.element.classList.remove('in-tree');
            _this.callBack();
        });
        return i;
    };

    public markInTree(): void {
        this.element.classList.add('in-tree');
    }
    public cleanMarkTree(): void {
        this.element.classList.remove('in-tree');
    }

}


