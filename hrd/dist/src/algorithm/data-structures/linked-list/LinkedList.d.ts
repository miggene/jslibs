import Comparator from '../../utils/comparator/Comparator';
import LinkedListNode from './LinkedListNode';
export default class LinkedList {
    head: LinkedListNode | null;
    tail: LinkedListNode | null;
    compare: Comparator;
    constructor(comparatorFunction?: Function);
    prepend(value: any): this;
    append(value: any): this;
    delete(value: any): LinkedListNode | null;
    find(params?: {
        value?: any;
        callback?: Function;
    }): LinkedListNode | null;
    deleteTail(): LinkedListNode | null;
    deleteHead(): LinkedListNode | null;
    fromArray(values: any[]): this;
    toArray(): LinkedListNode[];
    toString(callback?: Function): string;
    reverse(): this;
}
