/*
 * @Author: zhupengfei
 * @Date: 2021-12-09 09:55:04
 * @LastEditTime: 2021-12-09 10:01:35
 * @LastEditors: zhupengfei
 * @Description: 
 * @FilePath: /sgf/jest.config.js
 */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory:'coverage',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$'
};