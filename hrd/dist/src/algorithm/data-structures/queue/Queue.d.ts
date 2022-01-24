import LinkedList from '../linked-list/LinkedList';
export default class Queue {
    linkedList: LinkedList;
    constructor(linkedList?: LinkedList);
    isEmpty(): boolean;
    peek(): any;
    enqueue(value: any): void;
    dequeue(): any;
    toString(callback?: Function): string;
}
