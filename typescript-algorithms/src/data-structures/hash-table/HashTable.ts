// Hash table size directly affects on the number of collisions.
// The bigger the hash table size the less collisions you'll get.
// For demonstrating purposes hash table size is small to show how collisions
// are being handled.
import LinkedList from '../linked-list/LinkedList';
const defaultHashTableSize = 32;
export default class HashTable {
	public buckets: LinkedList[];
	private keys: { [key: string]: any };
	constructor(hashTableSize: number = defaultHashTableSize) {
		this.buckets = Array(hashTableSize)
			.fill(null)
			.map(() => new LinkedList());
		this.keys = {};
	}

	public hash(key: string) {
		// For simplicity reasons we will just use character codes sum of all characters of the key
		// to calculate the hash.
		//
		// But you may also use more sophisticated approaches like polynomial string hash to reduce the
		// number of collisions:
		//
		// hash = charCodeAt(0) * PRIME^(n-1) + charCodeAt(1) * PRIME^(n-2) + ... + charCodeAt(n-1)
		//
		// where charCodeAt(i) is the i-th character code of the key, n is the length of the key and
		// PRIME is just any prime number like 31.
		const hash = Array.from(key).reduce(
			(hashAccumulator, keySymbol) => hashAccumulator + keySymbol.charCodeAt(0),
			0
		);
		// Reduce hash number so it would fit hash table size.
		return hash % this.buckets.length;
	}

	public set(key: string, value: any) {
		const keyHash = this.hash(key);
		this.keys[key] = keyHash;
		const bucketLinkedList = this.buckets[keyHash];
		const node = bucketLinkedList.find({
			callback: (nodeValue: { key: string }) => nodeValue.key === key,
		});
		if (!node) {
			bucketLinkedList.append({ key, value });
		} else {
			node.value.value = value;
		}
	}

	public delete(key: string) {
		const keyHash = this.hash(key);
		delete this.keys[key];
		const bucketLinkedList = this.buckets[keyHash];
		const node = bucketLinkedList.find({
			callback: (nodeValue: { key: string }) => nodeValue.key === key,
		});
		if (node) return bucketLinkedList.delete(node.value);
		return null;
	}

	public get(key: string) {
		const bucketLinkedList = this.buckets[this.hash(key)];
		const node = bucketLinkedList.find({
			callback: (nodeValue: { key: string }) => nodeValue.key === key,
		});
		return node ? node.value.value : undefined;
	}

	public has(key: string) {
		return key in this.keys;
	}

	public getKeys() {
		return Object.keys(this.keys);
	}

	public getValues() {
		return this.buckets.reduce((values: any[], bucket) => {
			const bucketValues = bucket
				.toArray()
				.map((linkedListNode) => linkedListNode.value.value);
			return values.concat(bucketValues);
		}, []);
	}
}
