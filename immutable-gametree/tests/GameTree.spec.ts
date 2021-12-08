/*
 * @Author: zhupengfei
 * @Date: 2021-12-07 19:34:15
 * @LastEditTime: 2021-12-08 15:32:13
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/tests/GameTree.spec.ts
 */

import Draft from '../src/Draft';
import { NodeObject } from '../src/Interface';
import { childId1, childId2, childId3, id1, subChildId1, tree } from './data';

test('get method', () => {
	const node = tree.get(subChildId1);
	const parent = tree.get(childId3);
	expect(node).toStrictEqual({
		id: subChildId1,
		data: { B: ['dq'] },
		parentId: childId3,
		children: [],
	});
	expect(parent?.children[0]).toStrictEqual(node);
});

test('getSequence method', () => {
	const sequence1 = [...tree.getSequence(tree.root.id)!];
	expect(sequence1).toStrictEqual([tree.root, tree.get(id1)]);
	const sequence2 = [...tree.getSequence(childId3)!];
	expect(sequence2).toStrictEqual([tree.get(childId3), tree.get(subChildId1)]);

	const sequence3 = [...tree.getSequence(id1)!];
	expect(sequence3).toStrictEqual([tree.get(id1)]);
});

test('mutation uses structural sharing', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.updateProperty(childId1, 'MA', null);
	});
	const node = tree.get(childId2);
	const newNode = newTree.get(childId2);
	expect(node).toStrictEqual(newNode);
});

test('navigate method', () => {
	const tmpId = tree.navigate(tree.root.id, 1, {})?.id;
	expect(tmpId).toStrictEqual(id1);
	expect(tree.navigate(id1, -1, {})?.id).toStrictEqual(tree.root.id);
	expect(tree.navigate(id1, 1, {})?.id).toBe(childId1);
	expect(tree.navigate(id1, 1, { [id1]: childId2 })?.id).toBe(childId2);
});

test('navigate multiple steps ahead or behind', () => {
	expect(tree.navigate(childId2, -2, {})?.id).toBe(tree.root.id);
	expect(tree.navigate(tree.root.id, 3, { [id1]: childId3 })!.id).toBe(
		subChildId1
	);
	expect(tree.navigate(tree.root.id, 4, { [id1]: childId3 })).toBeNull();
	expect(tree.navigate(tree.root.id, -4, { [id1]: childId3 })).toBeNull();
});

test('listNodes method', () => {
	const nodes = [...tree.listNodes()];
	expect(nodes.length).toBe(6);
});

test('listNodesHorizontally method', () => {
	const list = [
		tree.root,
		tree.get(id1),
		tree.get(childId1),
		tree.get(childId2),
		tree.get(childId3),
		tree.get(subChildId1),
	];
	expect(tree.listNodesHorizontally(tree.root.id, 1)).toStrictEqual(list);
	expect(tree.listNodesHorizontally(tree.root.id, -1)).toStrictEqual([
		tree.root,
	]);

	expect(tree.listNodesHorizontally(childId3, -1)).toStrictEqual(
		list.slice(0, 5).reverse()
	);
	expect(tree.listNodesHorizontally(subChildId1, -1)).toStrictEqual(
		list.slice().reverse()
	);
	expect(tree.listNodesHorizontally(null!, 1)).toStrictEqual([]);
});

test('listNodesVertically method', () => {
	expect(tree.listNodesVertically(tree.root.id, 1, {})).toStrictEqual([
		tree.root,
		tree.get(id1),
		tree.get(childId1),
	]);
	expect(tree.listNodesVertically(tree.root.id, -1, {})).toStrictEqual([
		tree.root,
	]);
	expect([
		...tree.listNodesVertically(tree.root.id, 1, { [id1]: childId3 }),
	]).toStrictEqual([
		tree.root,
		tree.get(id1),
		tree.get(childId3),
		tree.get(subChildId1),
	]);
	expect(tree.listNodesVertically(childId3, -1, {})).toStrictEqual([
		tree.get(childId3),
		tree.get(id1),
		tree.root,
	]);
	expect(tree.listNodesVertically(subChildId1, -1)).toStrictEqual([
		tree.get(subChildId1),
		tree.get(childId3),
		tree.get(id1),
		tree.root,
	]);
	expect(tree.listNodesVertically(null!, 1)).toStrictEqual([]);
});

test('listCurrentNodes method', () => {
	expect(tree.listCurrentNodes({})).toStrictEqual([
		tree.root,
		tree.get(id1),
		tree.get(childId1),
	]);
	expect(tree.listCurrentNodes({ [id1]: childId3 })).toStrictEqual([
		tree.root,
		tree.get(id1),
		tree.get(childId3),
		tree.get(subChildId1),
	]);
});

test('getLevel method', () => {
	expect(tree.getLevel(tree.root.id)).toBe(0);
	expect(tree.getLevel(id1)).toBe(1);
	expect(tree.getLevel(childId2)).toBe(2);
	expect(tree.getLevel(subChildId1)).toBe(3);
});

test('getLevel should return null if node is not found', () => {
	expect(tree.getLevel(+'not found')).toBeNull();
});

test('getSection method', () => {
	expect(tree.getSection(-1)).toStrictEqual([]);
	expect([...tree.getSection(0)]).toStrictEqual([tree.root]);
	expect([...tree.getSection(2)]).toStrictEqual([
		tree.get(childId1),
		tree.get(childId2),
		tree.get(childId3),
	]);
	expect([...tree.getSection(3)]).toStrictEqual([tree.get(subChildId1)]);
	expect([...tree.getSection(4)]).toStrictEqual([]);
});

test('getCurrentHeight method', () => {
	expect(tree.getCurrentHeight({})).toBe(3);
	expect(tree.getCurrentHeight({ [id1]: childId3 })).toBe(4);
});

test('onCurrentLine method', () => {
	expect(tree.onCurrentLine(tree.root.id, {})).toBeTruthy();
	expect(tree.onCurrentLine(subChildId1, { [id1]: childId2 })).toBeFalsy();
	expect(tree.onCurrentLine(subChildId1, { [id1]: childId3 })).toBeTruthy();
	expect(tree.onCurrentLine(childId1, { [id1]: childId2 })).toBeFalsy();
});

test('getHeight method', () => {
	const newTree = tree.mutate((draft: Draft) => {
		draft.appendNode(subChildId1, {});
	});
	const height = tree.getHeight();
	expect(height).toBe(4);
	expect(newTree.getHeight()).toBe(5);
});

test('getStructureHash', () => {
	const hash = tree.getStructureHash();
	const sameStruction = tree.mutate((draft: Draft) => {
		draft.addToProperty(draft.root.id, 'MA', 'aa');
		draft.removeProperty(childId1, 'MA');
	});
	const differentStructure = sameStruction.mutate((draft: Draft) => {
		draft.appendNode(draft.root.id, {});
	});
	expect(hash).toStrictEqual(sameStruction.getStructureHash());
	expect(hash).not.toStrictEqual(differentStructure.getStructureHash());
});

test('getHash method', () => {
	const hash = tree.getHash();
	const tree2 = tree.mutate((draft: Draft) => {
		draft.addToProperty(draft.root.id, 'MA', 'aa');
		draft.removeProperty(childId1, 'MA');
	});
	const tree3 = tree2.mutate((draft: Draft) => {
		draft.appendNode(draft.root.id, {});
	});
	expect(hash).not.toStrictEqual(tree2.getStructureHash());
	expect(hash).not.toStrictEqual(tree3.getStructureHash());
});
