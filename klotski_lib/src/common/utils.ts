/*
 * @Author: zhupengfei
 * @Date: 2021-12-15 15:03:03
 * @LastEditTime: 2021-12-15 16:04:10
 * @LastEditors: zhupengfei
 * @Description: 常用工具函数
 * @FilePath: /klotski_lib/src/common/utils.ts
 */

import { readFile, writeFile } from 'fs/promises';
import { cloneDeep } from 'lodash';

export async function loadJson(absFilePath: string): Promise<any> {
	const data = await readFile(absFilePath, { encoding: 'utf-8' });
	return cloneDeep(JSON.parse(data));
}

export async function writeJson(absFilePath: string, data: string) {
	// writeFile(absFilePath, data, { encoding: 'utf-8' });
	try {
		writeFile(absFilePath, data, { encoding: 'utf-8' });
	} catch (error) {
		console.error(error);
	}
}
