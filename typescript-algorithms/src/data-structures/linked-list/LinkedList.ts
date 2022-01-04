import Comparator from '../../utils/comparator/Comparator';
import LinkedListNode from './LinkedListNode';

export default class LinkedList {
	public head: LinkedListNode | null;
	public tail: LinkedListNode | null;
	public compare: Comparator;
	constructor(comparatorFunction?: Function) {
		this.head = null;
		this.tail = null;
		this.compare = new Comparator(comparatorFunction);
	}

	public prepend(value: any) {
		const newNode = new LinkedListNode(value, this.head);
		this.head = newNode;
		if (!this.tail) this.tail = newNode;
		return this;
	}

	public append(value: any) {
		const newNode = new LinkedListNode(value);
		if (!this.head) {
			this.head = newNode;
			this.tail = newNode;
			return this;
		}
		this.tail!.next = newNode;
		this.tail = newNode;
		return this;
	}

	public delete(value: any) {
		if (!this.head) return null;
		let deletedNode = null;
		while (this.head && this.compare.equal(this.head.value, value)) {
			deletedNode = this.head;
			this.head = this.head.next;
		}
		let currentNode = this.head;
		if (currentNode !== null) {
			while (currentNode.next) {
				if (this.compare.equal(currentNode.next.value, value)) {
					deletedNode = currentNode.next;
					currentNode.next = currentNode.next.next;
				} else {
					currentNode = currentNode?.next;
				}
			}
		}
		if (this.compare.equal(this.tail?.value, value)) {
			this.tail = currentNode;
		}
		return deletedNode;
	}

	public find(
		params: { value?: any; callback?: Function } = {
			value: undefined,
			// callback: undefined,
		}
	) {
		const { value, callback } = params;
		if (!this.head) return null;
		let currentNode: LinkedListNode | null = this.head;
		while (currentNode) {
			if (callback && callback(currentNode.value)) return currentNode;
			if (value !== undefined && this.compare.equal(currentNode.value, value))
				return currentNode;
			currentNode = currentNode.next;
		}
		return null;
	}

	public deleteTail() {
		const deletedTail = this.tail;
		if (this.head === this.tail) {
			this.head = null;
			this.tail = null;
			return deletedTail;
		}
		let currentNode = this.head;
		while (currentNode?.next) {
			if (!currentNode.next.next) {
				currentNode.next = null;
			} else {
				currentNode = currentNode.next;
			}
		}
		this.tail = currentNode;
		return deletedTail;
	}

	public deleteHead() {
		if (!this.head) return null;
		const deletedHead = this.head;
		if (this.head.next) {
			this.head = this.head.next;
		} else {
			this.head = null;
			this.tail = null;
		}
		return deletedHead;
	}

	public fromArray(values: any[]) {
		values.forEach((v) => this.append(v));
		return this;
	}

	public toArray() {
		const nodes = [];
		let currentNode = this.head;
		while (currentNode) {
			nodes.push(currentNode);
			currentNode = currentNode.next;
		}
		return nodes;
	}

	public toString(callback?: Function) {
		return this.toArray()
			.map((node) => node.toString(callback))
			.toString();
	}

	public reverse() {
		let currNode = this.head;
		let prevNode = null;
		let nextNode = null;
		while (currNode) {
			nextNode = currNode.next;
			currNode.next = prevNode;
			prevNode = currNode;
			currNode = nextNode;
		}
		this.tail = this.head;
		this.head = prevNode;
		return this;
	}
}
