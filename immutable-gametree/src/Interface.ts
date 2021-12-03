/*
 * @Author: zhupengfei
 * @Date: 2021-12-02 16:36:36
 * @LastEditTime: 2021-12-03 18:07:17
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/src/Interface.ts
 */

export interface NodeObject {
	id: number;
	data: { [key: string]: any[] };
	parentId: number | null;
	children: NodeObject[];
}

// 存的是某节点的子节点id
export interface CurrentsObject {
	[id: number]: number;
}

export interface GameTreeOptions {
	getId?: Function;
	merger?: Function;
	root?: NodeObject;
}

export interface NodeCache {
	[key: number]: NodeObject | null;
}

export interface IdAliases {
	[key: number]: number;
}
