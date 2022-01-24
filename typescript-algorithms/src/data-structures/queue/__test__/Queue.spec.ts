import Queue from '../Queue';

describe('Queue', () => {
	test('should create empty queue', () => {
		const queue = new Queue();
		expect(queue).not.toBeNull();
		expect(queue.linkedList).not.toBeNull();
	});
	test('should enqueue data to queue', () => {
		const queue = new Queue();

		queue.enqueue(1);
		queue.enqueue(2);

		expect(queue.toString()).toBe('1,2');
	});
	test('should be possible to enqueue/dequeue objects', () => {
		const queue = new Queue();

		queue.enqueue({ value: 'test1', key: 'key1' });
		queue.enqueue({ value: 'test2', key: 'key2' });

		const stringifier = (value: { key: any; value: any }) =>
			`${value.key}:${value.value}`;

		expect(queue.toString(stringifier)).toBe('key1:test1,key2:test2');
		expect(queue.dequeue().value).toBe('test1');
		expect(queue.dequeue().value).toBe('test2');
	});
	test('should peek data from queue', () => {
		const queue = new Queue();

		expect(queue.peek()).toBeNull();

		queue.enqueue(1);
		queue.enqueue(2);

		expect(queue.peek()).toBe(1);
		expect(queue.peek()).toBe(1);
	});
	test('should check if queue is empty', () => {
		const queue = new Queue();

		expect(queue.isEmpty()).toBe(true);

		queue.enqueue(1);

		expect(queue.isEmpty()).toBe(false);
	});
	test('should dequeue from queue in FIFO order', () => {
		const queue = new Queue();

		queue.enqueue(1);
		queue.enqueue(2);

		expect(queue.dequeue()).toBe(1);
		expect(queue.dequeue()).toBe(2);
		expect(queue.dequeue()).toBeNull();
		expect(queue.isEmpty()).toBe(true);
	});
});
