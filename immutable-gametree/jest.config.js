/*
 * @Author: zhupengfei
 * @Date: 2021-12-06 17:39:28
 * @LastEditTime: 2021-12-06 17:48:45
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/jest.config.js
 */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
};
