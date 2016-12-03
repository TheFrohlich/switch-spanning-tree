

export class Logger {
    private view: HTMLElement;
    private counter: number
    constructor() {
        this.view = document.getElementById('loggerView');
        this.counter = 1;
    }
    log(message) {
        // this.view.innerText += `\n${this.counter}. ${message}`;
        // this.counter++;
    }
    clear(): void {
        // this.view.innerText = '';
        // this.counter = 1;
    }
    spacer(): void {
        // this.view.innerText += '\n--------------------------------------------------------------------------------';
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
        this.arcsList = arcsList;
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
    public connectorMessage: Message;
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
            logger.log(`node: ${this.name} arc:${arc.name}  Active:${arc.isActive}`);
            arc.isActive && arc.emit(this.message);
        }
    }
    public getMessage(): Message {
        return this.message;
    }
    public handleIncomingsMessage(incomingMessage: Message): void {
        if (incomingMessage.source == this.name) { throw Error('message sand to self !!'); }
        let log = true;

        let innerMessage = this.message;
        log && logger.log(`innerMessage ${innerMessage.toString2()}`);
        log && logger.log(`incomingMessage ${incomingMessage.toString2()}`)

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
                let tmp = this.compareNumbers(this.connectorMessage.steps, incomingMessage.steps);
                if (tmp === 0) {
                    if (this.connectorMessage.source.localeCompare(incomingMessage.source) === -1) {
                        log && logger.log("spacial");
                        log && logger.log(`Node ${this.name} message updated to ${innerMessage.toString2()}`);
                        log && logger.spacer();
                        return;
                    }
                }
                innerMessage.connector = incomingMessage.source;
                innerMessage.steps = incomingMessage.steps + 1;
            }
            if (stepsCompressionResult === 0) {
                let connectorComparisonResult = innerMessage.connector.localeCompare(incomingMessage.source);
                if (connectorComparisonResult === 1) {
                    innerMessage.connector = incomingMessage.connector;
                }
            }
        }
        let n = NodesMap.map.get(this.message.connector);
        n && (this.connectorMessage = n.message);
        log && logger.log(`Node ${this.name} message updated to ${innerMessage.toString2()}`);
        log && logger.spacer();

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
                    if (!this.startInterface.classList.contains('error') && !this.endInterface.classList.contains('error')) {
                        this.element.classList.remove('error');
                        this.isActive = true;
                    }
                    logger.log((target as Element).id + " is enabled");
                } :
                () => {
                    (target as Element).classList.add('error');
                    if (this.startInterface.classList.contains('error') || this.endInterface.classList.contains('error')) {
                        this.element.classList.add('error');
                        this.isActive = false;
                    }
                    logger.log((target as Element).id + " is disabled");
                }
            postEvent();
            console.log(`${this.name}: isActive = ${this.isActive}`);
            this.element.classList.remove('in-tree');
            this.callBack();
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

//// number of nonidentical spanning trees 
export class MatrixGraph {
    public degreeMatrix: Array<Array<number>>;
    public adjacencyMatrix: Array<Array<number>>;
    public laplasyan: Array<Array<number>>;


    constructor() {
        this.initDegrees();
        this.printMatrix(this.degreeMatrix);
        this.initAdjacency();
        this.printMatrix(this.adjacencyMatrix);
        this.calcLaplasyan();
        this.printMatrix(this.laplasyan);
        let removed = this.laplasyanRemove(2);
        this.printMatrix(removed);

        let res = this.determinant(this.laplasyan);

        console.log(res);
        res = this.determinant([
            [-1,-1,0],
            [0,2,-1],
            [-1,-1,2]
        ]);
        console.log(res);

    }

    public laplasyanRemove(number): Array<Array<number>> {
        let res = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0]
        ];
        
        this.laplasyan.shift();
        this.laplasyan.forEach((d)=> d.shift());
        return this.laplasyan;
    }
    public calcLaplasyan(): void {
        this.laplasyan = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ]
        let l = this.degreeMatrix.length;
        for (var i = 0; i < l; i++) {
            for (var j = 0; j < l; j++) {
                this.laplasyan[i][j] = this.degreeMatrix[i][j] - this.adjacencyMatrix[i][j];
            }
            // console.log(this.laplasyan[i].toString());
        }
    }
    public initAdjacency(): void {
        this.adjacencyMatrix = [
                /*A B C D E F G */
            /*A*/[0, 1, 0, 0, 1, 1, 0],
            /*B*/[1, 0, 1, 0, 1, 1, 1],
            /*C*/[0, 1, 0, 1, 0, 0, 1],
            /*D*/[0, 0, 1, 0, 1, 0, 1],
            /*E*/[1, 1, 0, 1, 0, 1, 1],
            /*F*/[1, 1, 0, 1, 1, 0, 0],
            /*G*/[0, 1, 1, 1, 1, 0, 0],
        ];
    }
    public initDegrees(): void {
        let degreesArray = [3, 5, 3, 3, 5, 3, 4];//d(A)....d(G)
        this.degreeMatrix = new Array<Array<number>>();
        for (let i = 0; i < 7; ++i) {
            this.degreeMatrix.push(new Array<number>(7).fill(0));
            this.degreeMatrix[i][i] = degreesArray[i];
        }
    }

    public printMatrix(m: Array<Array<number>>): void {
        let rs: string = '';
        for (var i = 0; i < m.length; ++i) {
            rs += '|[';
            rs += m[i].toString();
            rs += ']|\n';
        }
        console.log(rs);
    }
    public determinant(m) {
        var numRow = m.length;
        var numCol = m[0].length;
        var det = 0;
        var row, col;
        var diagLeft, diagRight;

        if (numRow === 1) {
            return m[0][0];
        } else if (numRow === 2) {
            return m[0][0] * m[1][1] - m[0][1] * m[1][0];
        }

        for (col = 0; col < numCol; col++) {
            diagLeft = m[0][col];
            diagRight = m[0][col];

            for (row = 1; row < numRow; row++) {
                diagRight *= m[row][(((col + row) % numCol) + numCol) % numCol];
                diagLeft *= m[row][(((col - row) % numCol) + numCol) % numCol];
            }

            det += diagRight - diagLeft;
        }

        return det;
    };

}






