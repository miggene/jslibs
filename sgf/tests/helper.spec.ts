import {
	escapeString,
	parseCompressedVertices,
	parseDates,
	parseVertex,
	stringifyDates,
	stringifyVertex,
	unescapeString,
} from '../src/helper';

/*
 * @Author: zhupengfei
 * @Date: 2021-12-09 10:08:48
 * @LastEditTime: 2021-12-09 16:09:26
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /sgf/tests/helper.spec.ts
 */
describe('escapeString', () => {
	test('should escape backslashes', () => {
		expect(escapeString('hello\\world')).toMatch('hello\\\\world');
	});
	test('should escape right brackets', () => {
		expect(escapeString('hello]world')).toMatch('hello\\]world');
	});
	test('should not escape left brackets', () => {
		expect(escapeString('hello[world')).toMatch('hello[world');
	});
});

describe('unescapeString', () => {
	test('should ignore escaped linebreaks', () => {
		expect(unescapeString('hellowor\\\nld')).toMatch('helloworld');
		expect(unescapeString('hellowor\\\rld')).toMatch('helloworld');
		expect(unescapeString('hello\\\n\rworld')).toMatch('helloworld');
		expect(unescapeString('hello\\\r\nworld')).toMatch('helloworld');
	});
	test('should unescape backslashes and right brackets', () => {
		expect(unescapeString('hello wor\\]ld')).toMatch('hello wor]ld');
		expect(unescapeString('hello wor\\\\ld')).toMatch('hello wor\\ld');
		expect(unescapeString('he\\]llo wor\\\\ld')).toMatch('he]llo wor\\ld');
	});
	test('should ignore other backslashes', () => {
		expect(unescapeString('h\\e\\llo world')).toMatch('hello world');
		expect(unescapeString('hello\\ world')).toMatch('hello world');
	});
	test('should be left inverse to escapeString', () => {
		const texts = ['He()llo Wor\\\\[Foo;Bar]ld\\', 'Hello\\! []World!'];
		texts.forEach((text) => {
			const tmp = escapeString(text);
			expect(unescapeString(tmp)).toMatch(text);
		});
	});
});

describe('parseDatess', () => {
	test('should parse comma-separated dates', () => {
		expect(parseDates('1996-12-27,1997-01-03')).toStrictEqual([
			[1996, 12, 27],
			[1997, 1, 3],
		]);
	});
	test('should be able to handle empyt strings', () => {
		expect(parseDates('')).toStrictEqual([]);
	});
	test('should handle short-hand notation', () => {
		expect(parseDates('1996-05,06')).toStrictEqual([
			[1996, 5],
			[1996, 6],
		]);
		expect(parseDates('1996-05,06-01')).toStrictEqual([
			[1996, 5],
			[1996, 6, 1],
		]);
		expect(parseDates('1996-05-06,07,08')).toStrictEqual([
			[1996, 5, 6],
			[1996, 5, 7],
			[1996, 5, 8],
		]);
		expect(parseDates('1996,1997')).toStrictEqual([[1996], [1997]]);
		expect(parseDates('1996-12-27,28,1997-01-03,04')).toStrictEqual([
			[1996, 12, 27],
			[1996, 12, 28],
			[1997, 1, 3],
			[1997, 1, 4],
		]);
	});
});

describe('stringifyDates', () => {
	test('should work', () => {
		expect(
			stringifyDates([
				[1996, 5],
				[1996, 6],
			])
		).toMatch('1996-05,06');
		expect(
			stringifyDates([
				[1996, 5],
				[1996, 6, 1],
			])
		).toMatch('1996-05,06-01');
		expect(stringifyDates([[1996, 5], [1997]])).toMatch('1996-05,1997');
		expect(
			stringifyDates([
				[1996, 5, 6],
				[1996, 5, 7],
				[1996, 5, 8],
			])
		).toMatch('1996-05-06,07,08');
		expect(stringifyDates([[1996], [1997]])).toMatch('1996,1997');
		expect(
			stringifyDates([
				[1996, 12, 27],
				[1996, 12, 28],
				[1997, 1, 3],
				[1997, 1, 4],
			])
		).toMatch('1996-12-27,28,1997-01-03,04');
	});
	test('should be able to handle empty strings', () => {
		expect(stringifyDates([])).toMatch('');
	});
	test('should be inverse to parseDates', () => {
		expect(
			parseDates(
				stringifyDates([
					[1996, 5],
					[1996, 6],
				])
			)
		).toStrictEqual([
			[1996, 5],
			[1996, 6],
		]);
		expect(
			parseDates(
				stringifyDates([
					[1996, 5, 6],
					[1996, 5, 7],
					[1996, 5, 8],
				])
			)
		).toStrictEqual([
			[1996, 5, 6],
			[1996, 5, 7],
			[1996, 5, 8],
		]);

		expect(parseDates(stringifyDates([[1996], [1997]]))).toStrictEqual([
			[1996],
			[1997],
		]);

		expect(
			parseDates(
				stringifyDates([
					[1996, 12, 27],
					[1996, 12, 28],
					[1997, 1, 3],
					[1997, 1, 4],
				])
			)
		).toStrictEqual([
			[1996, 12, 27],
			[1996, 12, 28],
			[1997, 1, 3],
			[1997, 1, 4],
		]);

		expect(stringifyDates(parseDates('1996-05,06')!)).toMatch('1996-05,06');
		expect(stringifyDates(parseDates('1996-05-06,07,08')!)).toMatch(
			'1996-05-06,07,08'
		);
		expect(stringifyDates(parseDates('1996,1997')!)).toMatch('1996,1997');
		expect(stringifyDates(parseDates('1996-12-27,28,1997-01-03,04')!)).toMatch(
			'1996-12-27,28,1997-01-03,04'
		);
	});
});

describe('parseVertex', () => {
	test('should return [-1,-1] when passing string with length>0', () => {
		expect(parseVertex('')).toStrictEqual([-1, -1]);
		expect(parseVertex('d')).toStrictEqual([-1, -1]);
		expect(parseVertex('blah')).toStrictEqual([-1, -1]);
	});

	test('should work', () => {
		expect(parseVertex('bb')).toStrictEqual([1, 1]);
		expect(parseVertex('jj')).toStrictEqual([9, 9]);
		expect(parseVertex('jf')).toStrictEqual([9, 5]);
		expect(parseVertex('fa')).toStrictEqual([5, 0]);
		expect(parseVertex('fA')).toStrictEqual([5, 26]);
		expect(parseVertex('AB')).toStrictEqual([26, 27]);
	});

	test('should be left inverse to stringifyVertex', () => {
		const tests: Array<[number, number]> = [
			[-1, -1],
			[10, 5],
			[9, 28],
			[30, 27],
			[0, 0],
		];
		tests.forEach((test) =>
			expect(parseVertex(stringifyVertex(test))).toStrictEqual(test)
		);
	});
});

describe('stringifyVertex', () => {
	test('should return empty string when passing negativate values', () => {
		expect(stringifyVertex([-4, -5])).toMatch('');
		expect(stringifyVertex([-4, 5])).toMatch('');
		expect(stringifyVertex([4, -5])).toMatch('');
	});

	test('should work', () => {
		expect(stringifyVertex([1, 1])).toMatch('bb');
		expect(stringifyVertex([9, 9])).toMatch('jj');
		expect(stringifyVertex([9, 5])).toMatch('jf');
		expect(stringifyVertex([5, 0])).toMatch('fa');
		expect(stringifyVertex([5, 26])).toMatch('fA');
		expect(stringifyVertex([26, 27])).toMatch('AB');
	});

	test('should be left inverse to parseVertex', () => {
		const tests = ['', 'df', 'AB', 'fA', 'fa'];
		tests.forEach((test) => {
			expect(stringifyVertex(parseVertex(test))).toMatch(test);
		});
	});
});

describe('parseCompressedVertices', () => {
	test('should handle points normally', () => {
		expect(parseCompressedVertices('ce')).toStrictEqual([parseVertex('ce')]);
		expect(parseCompressedVertices('aa')).toStrictEqual([parseVertex('aa')]);
		expect(parseCompressedVertices('Az')).toStrictEqual([parseVertex('Az')]);
	});

	test('should handle one point compression', () => {
		expect(parseCompressedVertices('ce:ce')).toStrictEqual([parseVertex('ce')]);
		expect(parseCompressedVertices('aa:aa')).toStrictEqual([parseVertex('aa')]);
		expect(parseCompressedVertices('Az:Az')).toStrictEqual([parseVertex('Az')]);
	});

	test('should handle compressions', () => {
		expect(parseCompressedVertices('aa:bb')).toStrictEqual([
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		]);

		expect(parseCompressedVertices('bb:aa')).toStrictEqual([
			[0, 0],
			[0, 1],
			[1, 0],
			[1, 1],
		]);
	});
});
