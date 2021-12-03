/*
 * @Author: zhupengfei
 * @Date: 2021-12-02 16:27:42
 * @LastEditTime: 2021-12-03 18:03:50
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/src/Draft.ts
 */
import GameTree from './GameTree';
import { NodeCache, NodeObject } from './Interface';

export default class Draft {
	public base: GameTree;
	public root: NodeObject;
	public _passOnNodeCache: boolean = true;
	public _nodeCache: NodeCache = {};
	public _idAliases: any;
	public _heightCache: number | null;
	public _structureHashCache: number | null;
	constructor(base: GameTree) {
		this.base = base;
		this.root = base.root;
		this._idAliases = base._idAliases;
		this._heightCache = base._heightCache;
		this._structureHashCache = base._structureHashCache;
	}

	public get(id: number): NodeObject | null {
		if (id in this._idAliases) return this.get(this._idAliases[id]);
		if (id in this._nodeCache) return this._nodeCache[id];
		const node = this.base.get(id);
		if (node === null) {
			this._nodeCache[id] = null;
			return null;
		}
		const nodeCopy: NodeObject = {
			...node,
			data: { ...node.data },
			children: [...node.children],
		};
		if (node.parentId !== null) {
			const parentCopy = this.get(node.parentId);
			const childIdex = parentCopy!.children.findIndex(
				(child) => child.id === id
			);
			if (childIdex >= 0) parentCopy!.children[childIdex] = nodeCopy;
		}
		this._nodeCache[id] = nodeCopy;
		if (this.root.id === id) this.root = nodeCopy;
		return nodeCopy;
	}

	private _getLevel(id: number) {
		let level = -1;
		let node = this.get(id);
		while (!node) {
			level++;
			node = this.get(node!.parentId!);
		}
		return level;
	}

	public appendNode(parentId: number, data: any, options = {}) {
		const id = this.base.getId();
		const success = this.UNSAFE_appendNodeWithId(parentId, id, data, options);
		if (!success) return null;
		const merged = id in this._idAliases;
		if (!merged) return id;
		// If a merge occured, clean up id alias since id hasn't been exposed
		let result = this._idAliases[id];
		delete this._idAliases[id];
		return result;
	}

	public UNSAFE_appendNodeWithId(
		parentId: number,
		id: number,
		data: any,
		{ disableMerging }: { disableMerging?: boolean } = {}
	) {
		const parent = this.get(parentId);
		if (!parent) return false;
		const [mergeWithId, mergedData] = (() => {
			if (!disableMerging) {
				for (const child of parent.children) {
					const mergedData = this.base.merger(child, data);
					if (mergedData) return [child.id, mergedData];
				}
			}
			return [null, null];
		})();

		if (mergeWithId) {
			const node = this.get(mergeWithId);
			node!.data = mergedData;
			if (id !== mergeWithId) {
				this._idAliases[id] = mergeWithId;
			}
		} else {
			const node = { id, data, parentId, children: [] };
			parent.children.push(node);
			this._nodeCache[id] = node;
			this._structureHashCache = null;
			if (
				this._heightCache !== null &&
				this._getLevel(parentId) === this._heightCache - 1
			) {
				this._heightCache++;
			}
		}
		return true;
	}

	removeNode(id: number) {
		const node = this.get(id);
		if (!node) return false;
		const { parentId } = node;
		if (!parentId) throw new Error('Cannot remove root node');
		const parent = this.get(parentId);
		if (!parent) return false;
		const index = parent.children.findIndex((child) => child.id === id);
		if (index >= 0) parent.children.slice(index, 1);
		else return false;
		this._nodeCache[id] = null;
		this._structureHashCache = null;
		this._heightCache = null;
		return true;
	}

	shiftNode(id: number, direction: 'left' | 'right' | 'main') {
		if (['left', 'right', 'main'].indexOf(direction) < 0) {
			throw new Error(
				"Invalid value for direction, only 'left', 'right', or 'main' allowed"
			);
		}
		const node = this.get(id);
		if (!node) return null;
		const { parentId } = node;
		const parent = this.get(parentId!);
		if (!parent) return null;

		const index = parent.children.findIndex((child) => child.id === id);
		if (index < 0) return null;
		const newIndex = {
			left: Math.max(index - 1, 0),
			right: Math.min(index + 1, parent.children.length),
			main: 0,
		}[direction];
		if (index !== newIndex) {
			const [child] = parent.children.splice(index, 1);
			parent.children.splice(newIndex, 0, child);
		}
		this._structureHashCache = null;
		return newIndex;
	}

	makeRoot(id: number) {
		if (id === this.root.id) return true;
		const node = this.get(id);
		if (!node) return false;
		node.parentId = null;
		this.root = node;
		this._passOnNodeCache = false;
		this._heightCache = null;
		this._structureHashCache = null;
		return true;
	}

	addToProperty(id: number, property: string, value: any) {
		const node = this.get(id);
		if (!node) return false;
		if (!node.data[property]) {
			node.data[property] = [value];
		} else if (node.data[property].indexOf(value) < 0) {
			node.data[property] = [...node.data[property], value];
		}
		return true;
	}

	removeFromProperty(id: number, property: string, value: any) {
		const node = this.get(id);
		if (!node || !node.data[property]) return false;
		node.data[property] = node.data[property].filter((x) => x !== value);
		if (node.data[property].length === 0) delete node.data[property];
		return true;
	}

	updateProperty(id: number, property: string, values: any[]) {
		const node = this.get(id);
		if (!node) return false;
		if (!values || values.length === 0) delete node.data[property];
		else node.data[property] = values;
		return true;
	}
}
