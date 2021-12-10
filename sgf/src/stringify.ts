/*
 * @Author: zhupengfei
 * @Date: 2021-12-10 09:49:29
 * @LastEditTime: 2021-12-10 11:18:30
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /sgf/src/stringify.ts
 */

import { escapeString } from './helper';

export type Options = {
	linebreak?: string;
	indent?: string;
	level?: number;
};

export function stringify(
	node: any,
	{ linebreak = '\n', indent = '  ', level = 0 }: Options = {}
): string {
	if (Array.isArray(node)) {
		return stringify({ children: node }, { linebreak, level });
	}
	let output = [];
	let totalIndent = linebreak !== '' ? indent.repeat(level) : '';
	if (node.data !== null && node.data !== undefined) {
		output.push(totalIndent, ';');
		for (const id in node.data) {
			if (Object.prototype.hasOwnProperty.call(node.data, id)) {
				if (id.toUpperCase() !== id) continue;
				output.push(id, '[', node.data[id].map(escapeString).join(']['), ']');
			}
		}
		output.push(linebreak);
	}
	if (node.children.length > 1 || (node.children.length > 0 && level === 0)) {
		output.push(totalIndent);
		for (const child of node.children) {
			output.push(
				'(',
				linebreak,
				stringify(child, { linebreak, level: level + 1 }),
				totalIndent,
				')'
			);
		}
		output.push(linebreak);
	} else if (node.children.length === 1) {
		output.push(stringify(node.children[0], { linebreak, level }));
	}
	return output.join('');
}
