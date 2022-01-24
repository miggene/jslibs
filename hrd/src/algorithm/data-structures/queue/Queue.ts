import LinkedList from '../linked-list/LinkedList';

export default class Queue {
	// We're going to implement Queue based on LinkedList since the two
	// structures are quite similar. Namely, they both operate mostly on
	// the elements at the beginning and the end. Compare enqueue/dequeue
	// operations of Queue with append/deleteHead operations of LinkedList.
	constructor(public linkedList: LinkedList = new LinkedList()) {}
	public isEmpty() {
		return !this.linkedList.head;
	}
	public peek() {
		if (!this.linkedList.head) return null;
		return this.linkedList.head.value;
	}
	public enqueue(value: any) {
		this.linkedList.append(value);
	}
	public dequeue() {
		const removedHead = this.linkedList.deleteHead();
		return removedHead ? removedHead.value : null;
	}
	public toString(callback?: Function) {
		return this.linkedList.toString(callback);
	}
}
