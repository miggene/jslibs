import Draft from './Draft';
import { hasher } from './Hasher';
import {
	CurrentsObject,
	GameTreeOptions,
	IdAliases,
	NodeCache,
	NodeObject,
} from './Interface';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-02 16:42:42
 * @LastEditTime: 2021-12-03 18:07:57
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/src/GameTree.ts
 */
export default class GameTree {
	public getId: Function;
	public merger: Function;
	public root: NodeObject;

	private _nodeCache: NodeCache = {};
	public _idAliases: IdAliases = {};
	public _heightCache: number | null = null;
	private _hashCache: number | null = null;
	public _structureHashCache: number | null = null;
	constructor(opts: GameTreeOptions = {}) {
		let { getId, merger, root } = opts;
		this.getId =
			getId ||
			(
				(id = 0) =>
				() =>
					id++
			)();
		this.merger = merger || (() => null);
		this.root = {
			id: this.getId(),
			data: {},
			parentId: null,
			children: [],
			...(root || {}),
		};
	}

	public get(id: number): NodeObject | null {
		let node: NodeObject | null;
		if (id in this._idAliases) return this.get(this._idAliases[id]);
		if (id in this._nodeCache) {
			node = this._nodeCache[id];
		} else {
			const inner: (param: NodeObject) => NodeObject | null = (
				node: NodeObject
			) => {
				this._nodeCache[node.id] = node;
				if (node.id === id) return node;
				for (const child of node.children) {
					const result = inner(child);
					if (result !== null) return result;
				}
				return null;
			};
			node = inner(this.root);
		}

		if (node === null) {
			this._nodeCache[id] = null;
			return null;
		}

		for (const child of node.children) {
			this._nodeCache[child.id] = child;
		}
		return node;
	}

	// starting with the node of the given id and continuing with its children until we reach a descendant which has multiple or no children.
	public getSequence(id: number): NodeObject[] | null {
		let node = this.get(id);
		if (!node) return null;
		let ret = [node];
		while (node.children.length === 1) {
			node = node!.children[0];
			this._nodeCache[node.id] = node;
			for (const child of node.children) {
				this._nodeCache[child.id] = child;
			}
			ret.push(node);
		}
		return ret;
	}

	// TODO:
	public mutate(mutator: any) {
		const draft = new Draft(this);
		mutator(draft);
		if (draft.root === this.root) return this; //TODO:待考究
		const tree = new GameTree({
			getId: this.getId,
			merger: this.merger,
			root: draft.root,
		});
		if (draft._passOnNodeCache) tree._nodeCache = draft._nodeCache;
		tree._idAliases = draft._idAliases;
		tree._structureHashCache = draft._structureHashCache;
		tree._heightCache = draft._heightCache;
		return tree;
	}

	public navigate(
		id: number,
		step: number,
		currents?: CurrentsObject
	): NodeObject | null {
		const node = this.get(id);
		if (!node) return null;
		if (step === 0) return node;
		if (step < 0) return this.navigate(node.parentId!, step + 1);
		const nextId =
			currents![node.id] !== null
				? currents![node.id]
				: node.children.length > 0
				? node.children[0].id
				: null;
		if (!nextId) return null;
		return this.navigate(nextId, step - 1, currents);
	}

	public listNodes(node: NodeObject = this.root) {
		let ret = [node];
		for (const child of node.children) {
			ret = ret.concat(this.listNodes(child));
		}
		return ret;
	}

	public listNodesHorizontally(startId: number, step: 1 | -1): NodeObject[] {
		let level = this.getLevel(startId);
		let section = [...this.getSection(level!)!];
		let index = section.findIndex((node) => node.id === startId);
		let ret: NodeObject[] = [];
		while (index > -1) {
			while (index >= 0 && index < section.length) {
				ret = ret.concat([section[index]]);
				index += step;
			}
			level! += step;
			section =
				step > 0
					? ([] as NodeObject[]).concat(...section.map((node) => node.children))
					: [...this.getSection(level!)!];
			index = step > 0 ? 0 : section.length - 1;
		}
		return ret;
	}

	public listNodesVertically(
		startId: number,
		step: 1 | -1,
		currents: CurrentsObject
	): NodeObject[] {
		const id = startId;
		let node = this.get(id);
		let ret: NodeObject[] = [];
		while (!node) {
			ret.push(node!);
			node = this.navigate(node!.id, step, currents);
		}
		return ret;
	}

	public listCurrentNodes(currents: CurrentsObject): NodeObject[] {
		return this.listNodesVertically(this.root.id, 1, currents);
	}

	public listMainNodes() {
		return this.listCurrentNodes({});
	}

	public getLevel(id: number) {
		// let result = -1;
		// for (const node of this.listNodesVertically(id, -1, {})) {
		// 	result++;
		// }
		// return result < 0 ? null : result;
		const len = this.listNodesVertically(id, -1, {}).length;
		return len === 0 ? null : len - 1;
	}

	public getSection(level: number): NodeObject[] | undefined {
		if (level < 0) return;
		if (level === 0) {
			return [this.root];
		}
		let ret: NodeObject[] = [];
		for (const parent of this.getSection(level - 1)!) {
			ret = ret.concat(parent.children);
		}
		return ret;
	}

	public getCurrentHeight(currents: CurrentsObject) {
		let result = 0;
		let tmpNode = this.root;
		while (tmpNode !== null) {
			result++;
			tmpNode =
				currents[tmpNode.id] === null
					? tmpNode.children[0]
					: tmpNode.children.find(
							(child) => child.id === currents[tmpNode.id]
					  )!;
		}
		return result;
	}

	public getHeight() {
		if (this._heightCache === null) {
			const inner = (node: NodeObject) => {
				let max = 0;
				for (const child of node.children) {
					max = Math.max(max, inner(child));
				}
				return max + 1;
			};
			this._heightCache = inner(this.root);
		}
		return this._heightCache;
	}

	public getStructureHash() {
		if (this._structureHashCache === null) {
			const hash = hasher();
			const inner = (node: NodeObject) => {
				hash('[' + JSON.stringify(node.id) + ',');
				node.children.forEach(inner);
				return hash(']');
			};
			this._structureHashCache = inner(this.root);
		}
		return (this._structureHashCache! >>> 0) + '';
	}

	public getHash() {
		if (this._hashCache === null) {
			const hash = hasher();
			const inner = (node: NodeObject) => {
				hash('[' + JSON.stringify(node.data) + ',');
				node.children.forEach(inner);
				return hash(']');
			};
			this._hashCache = inner(this.root);
		}
		return (this._hashCache >>> 0) + '';
	}

	onCurrentLine(id: number, currents: CurrentsObject) {
		for (const node of this.listNodesVertically(id, -1, {})) {
			const { parentId } = node;
			if (
				parentId !== null &&
				currents[parentId] !== node.id &&
				(currents[parentId] !== null ||
					this.get(parentId!)?.children[0] !== node)
			) {
				return false;
			}
		}
		return true;
	}

	onMainLine(id: number) {
		return this.onCurrentLine(id, {});
	}

	toJSON() {
		return this.root;
	}
}
