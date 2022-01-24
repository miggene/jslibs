/*
 * @Author: zhupengfei
 * @Date: 2021-12-15 15:16:25
 * @LastEditTime: 2021-12-17 18:02:46
 * @LastEditors: zhupengfei
 * @Description: 索引页
 * @FilePath: /klotski_lib/index.ts
 */

import { orderBy } from 'lodash';
import path from 'path';
import { loadJson, writeJson } from './src/common/utils';
import { transformData } from './src/klotskiHelper';
import KlotskiSolution from './src/klotskiSolver';

async function getSortedJson() {
	let json = await loadJson(path.join(__dirname, './data/hrd_levels.json'));
	json = orderBy(
		json as {
			level: number;
			mini: number;
			tableId: number;
			board: string[];
			empty: number;
			[key: string]: any;
		}[],
		['mini', 'tableId', 'level'],
		['asc', 'asc', 'asc']
	);
	return json;
}

async function writeSortedJson() {
	const json = await getSortedJson();
	try {
		writeJson(
			path.join(__dirname, './data/hrd_sorted_levels.json'),
			JSON.stringify(json)
		);
	} catch (error) {
		console.error('error >>:', error);
	}
}

async function main() {
	const data = (await loadJson(path.join(__dirname, './data/levels.json')))
		.RECORDS;

	// const levels = [];
	// for (const { board, level } of data) {
	// 	const trsData = transformData(board, level, true);
	// 	levels.push(trsData);
	// }
	// writeJson(
	// 	path.join(__dirname, './data/hrd_new_levels.json'),
	// 	JSON.stringify(levels)
	// );
	let ret = [];
	for (const { board, level } of data) {
		const solver = new KlotskiSolution();
		solver.init(board);
		const answer = solver.find();
		ret.push({ board, level, ...answer, mini: answer.boardList!.length - 1 });
	}
	writeJson(
		path.join(__dirname, './data/hrd_answers_straight.json'),
		JSON.stringify(ret)
	);
}

main();
