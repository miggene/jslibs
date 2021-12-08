/*
 * @Author: zhupengfei
 * @Date: 2021-12-08 15:18:18
 * @LastEditTime: 2021-12-08 18:03:24
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/tests/Draft.spec.ts
 */

import Draft from '../src/Draft';
import { tree, id1, childId1, childId2, childId3 } from './data';

test('appendNode operation', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.appendNode(childId2, { B: ['qq'] });
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(tree.get(childId2)?.children).toStrictEqual([]);
	expect(newTree.get(childId2)?.children.length).toBe(1);
	expect(newTree.get(childId2)?.children[0].parentId).toBe(childId2);
	expect(newTree.get(childId2)?.children[0].data).toStrictEqual({ B: ['qq'] });
});

test('appendNode should merge nodes according to merge function', () => {
	let newId: number | null;
	const newTree = tree.mutate((draft: Draft) => {
		newId = draft.appendNode(draft.root.id, { B: ['dd'] });
		draft.UNSAFE_appendNodeWithId(draft.root.id, 999, { B: ['dd'] });
	});
	expect(newId!).toBe(id1);
	expect(newTree.get(999)).toStrictEqual(newTree.get(id1));
	expect(newTree.listNodes().length).toBe(tree.listNodes().length);
});

test('appendNode should respect disableMerging option', () => {
	let newId: number | null;
	const newTree = tree.mutate((draft: Draft) => {
		newId = draft.appendNode(
			draft.root.id,
			{ B: ['dd'] },
			{ disableMerging: true }
		);
		draft.UNSAFE_appendNodeWithId(
			draft.root.id,
			999,
			{ B: ['dd'] },
			{ disableMerging: true }
		);
	});
	expect(newId!).not.toBe(id1);
	expect(newTree.get(999)).not.toBe(id1);
	expect(newTree.listNodes().length).not.toBe(tree.listNodes().length);
});

test('removeNode operation', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.removeNode(childId2);
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(newTree.get(childId2)).toBeNull();
	expect(newTree.get(id1)?.children[0].id).toBe(childId1);
});

test('removeNode should remove all children', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.removeNode(id1);
	});
	expect(newTree.get(childId1)).toBeNull();
	expect(newTree.get(childId2)).toBeNull();
});

test('removeNode should throw when removing root node', () => {
	tree.mutate((draft: Draft) => {
		function removeNode() {
			draft.removeNode(draft.root.id);
		}
		expect(removeNode).toThrow('Cannot remove root node');
	});
});

test('shiftNode operation', () => {
	let newTree = tree.mutate((draft: Draft) => {
		draft.shiftNode(childId3, 'left');
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(newTree.get(id1)?.children.map((x) => x.id)).toStrictEqual([
		childId1,
		childId3,
		childId2,
	]);
	newTree = newTree.mutate((draft: Draft) => {
		draft.shiftNode(childId1, 'right');
	});
	expect(newTree.get(id1)?.children.map((x) => x.id)).toStrictEqual([
		childId3,
		childId1,
		childId2,
	]);
	newTree = newTree.mutate((draft: Draft) => {
		draft.shiftNode(childId2, 'main');
	});
	expect(newTree.get(id1)?.children.map((x) => x.id)).toStrictEqual([
		childId2,
		childId3,
		childId1,
	]);
});

test('shiftNode should not move nodes out of bounds', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.shiftNode(childId1, 'left');
		draft.shiftNode(childId3, 'right');
	});
	expect(newTree.get(id1)?.children.map((x) => x.id)).toStrictEqual([
		childId1,
		childId2,
		childId3,
	]);
});

test('makeRoot operation', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.makeRoot(id1);
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(newTree.get(tree.root.id)).toBeNull();
	expect(newTree.root).toStrictEqual({ ...tree.get(id1), parentId: null });
	expect(newTree.root.parentId).toBeNull();
});

test('addToProperty operation', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.addToProperty(id1, 'C', 'Hello World!');
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(newTree.get(id1)?.data).toStrictEqual({
		B: ['dd'],
		C: ['Hello World!'],
	});
	const newTree2 = newTree.mutate((draft: Draft) => {
		draft.addToProperty(id1, 'C', 'Test 2');
	});
	expect(newTree2.get(id1)?.data).toStrictEqual({
		B: ['dd'],
		C: ['Hello World!', 'Test 2'],
	});
});

test('addToProperty should not add existing values', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.addToProperty(id1, 'B', 'dd');
	});
	expect(newTree.get(id1)?.data).toStrictEqual({ B: ['dd'] });
});

test('removeFromProperty operation', () => {
	expect(tree.get(childId1)?.data.MA).toStrictEqual(['qd', 'qq']);
	const newTree = tree.mutate((draft: Draft) => {
		draft.removeFromProperty(childId1, 'MA', 'qq');
	});
	expect(newTree.get(childId1)?.data.MA).toStrictEqual(['qd']);
});

test('removeFromProperty should remove property entirely when no values are left', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.removeFromProperty(childId1, 'W', 'dq');
	});
	expect(newTree.get(childId1)?.data).not.toHaveProperty('W');
});

test('removeFromProperty should ignore values that do not exist', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.removeFromProperty(childId1, 'W', 'dd');
	});
	expect(newTree.get(childId1)?.data.W).toStrictEqual(['dq']);
});

test('updateProperty operation', () => {
	const values = ['dd', 'ee'];
	const newTree = tree.mutate((draft: Draft) => {
		draft.updateProperty(childId1, 'MA', values);
	});
	expect(newTree).not.toStrictEqual(tree);
	expect(tree.get(childId1)?.data.MA).toStrictEqual(['qd', 'qq']);
	expect(newTree.get(childId1)?.data.MA).toStrictEqual(values);
});

test('updateProperty should remove property entirely when values is null or empty', () => {
	let newTree = tree.mutate((draft: Draft) => {
		draft.updateProperty(childId1, 'MA', []);
	});
	expect(newTree.get(childId1)?.data).not.toHaveProperty('MA');
	newTree = tree.mutate((draft: Draft) => {
		draft.updateProperty(childId1, 'MA', null);
	});
	expect(newTree.get(childId1)?.data).not.toHaveProperty('MA');
});
