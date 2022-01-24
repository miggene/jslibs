import LinkedList from '../linked-list/LinkedList';
export default class HashTable {
    buckets: LinkedList[];
    private keys;
    constructor(hashTableSize?: number);
    hash(key: string): number;
    set(key: string, value: any): void;
    delete(key: string): import("../linked-list/LinkedListNode").default | null;
    get(key: string): any;
    has(key: string): boolean;
    getKeys(): string[];
    getValues(): any[];
}
