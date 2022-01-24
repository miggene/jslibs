/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	// The directory where Jest should output its coverage files.
	coverageDirectory: './coverage/',
	// The pattern Jest uses to detect test files.
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
};
