
import { GGraph, GNode, GArc,Logger ,MatrixGraph} from './graph';

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

var g = new GGraph(document.getElementById('tree-frame'), nodes, arcs);

var m = new MatrixGraph();
