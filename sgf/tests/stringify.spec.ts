import { stringify } from '../src/stringify';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-10 10:50:58
 * @LastEditTime: 2021-12-10 11:52:35
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /sgf/tests/stringify.spec.ts
 */
const gametrees = [
	{
		data: { B: ['aa'], SZ: ['19'] },
		children: [
			{
				data: { AB: ['cc', 'dd:ee'] },
				children: [],
			},
		],
	},
	{
		data: { CP: ['Copyright'] },
		children: [
			{
				data: { B: ['ab'] },
				children: [],
			},
			{
				data: { W: ['ac'] },
				children: [],
			},
		],
	},
];

test('should stringify single game tree with parenthesis', () => {
	expect(gametrees.slice(0, 1)).toMatch(
		'(\n  ;B[aa]SZ[19]\n  ;AB[cc][dd:ee]\n)\n'
	);
});

test('should stringify multiple game trees with correct indentation', () => {
	expect(stringify(gametrees)).toMatch(
		'(\n  ;B[aa]SZ[19]\n  ;AB[cc][dd:ee]\n)(\n  ;CP[Copyright]\n  (\n    ;B[ab]\n  )(\n    ;W[ac]\n  )\n)\n'
	);
});

test('should respect line break option', () => {
	expect(stringify(gametrees, { linebreak: '' })).toMatch(
		'(;B[aa]SZ[19];AB[cc][dd:ee])(;CP[Copyright](;B[ab])(;W[ac]))'
	);
});

test('should ignore mixed case node properties', () => {
	expect(
		stringify({
			data: { B: ['ab'], board: 'should ignore' },
			children: [],
		})
	).toMatch(';B[ab]\n');
});
