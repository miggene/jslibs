/*
 * @Author: zhupengfei
 * @Date: 2021-12-06 17:51:02
 * @LastEditTime: 2021-12-08 16:28:49
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/tests/data.ts
 */

import Draft from '../src/Draft';
import GameTree from '../src/GameTree';
import { DataObject, NodeObject } from '../src/Interface';

const merger = (node: NodeObject, data: DataObject) => {
	if (
		(node.data.B && data.B && node.data.B[0] === data.B[0]) ||
		(node.data.W && data.W && node.data.W[0] === data.W[0])
	) {
		return data;
	}
	return null;
};

let id1: number,
	childId1: number,
	childId2: number,
	childId3: number,
	subChildId1: number;
const tree = new GameTree({ merger }).mutate((draft: Draft) => {
	id1 = draft.appendNode(draft.root.id, { B: ['dd'] })!;
	childId1 = draft.appendNode(id1!, { W: ['dq'], MA: ['qd', 'qq'] })!;
	childId2 = draft.appendNode(id1!, { W: ['qd'] })!;
	childId3 = draft.appendNode(id1!, { W: ['qq'] })!;
	subChildId1 = draft.appendNode(childId3!, { B: ['dq'] })!;
});

export { tree, id1, childId1, childId2, childId3, subChildId1 };
