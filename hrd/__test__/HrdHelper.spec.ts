import {
	boardCharIndexArr2Key,
	convertBoardPos2Index,
	convertBoardStr2BoardCharIndexArr,
	getBlockSize,
	key2BoardStringArr,
	verifyBoard,
} from '../src/HrdHelper';
import { data } from './data/hrd_answers_straight';

describe('HrdHelper', () => {
	test('convert boardstring to block char index arr', () => {
		const boardStr = data[4].board;
		const boardIndexArr = convertBoardStr2BoardCharIndexArr(boardStr);
		expect(boardIndexArr).toMatchObject([
			9, 15, 16, 1, 9, 17, 18, 1, 3, 3, 4, 4, 10, 11, 2, 2, 10, 11, 2, 2,
		]);
	});
	test('convertBoardPos2Index', () => {
		expect(convertBoardPos2Index(4, 1)).toBe(17);
	});

	test('getBlockSize', () => {
		expect(getBlockSize(2)).toMatchObject([2, 2]);
		expect(getBlockSize(3)).toMatchObject([1, 2]);
	});

	test('verifyBoard', () => {
		function boardMoreChars() {
			const boardStr = 'BBCCDD@@EEFFNOAAPQAA';
			verifyBoard(boardStr);
		}
		function boardLessChars() {
			const boardStr = 'HNO@HPQ@BBCCIJAAIJAA';
			verifyBoard(boardStr);
		}
		function boardDuplicateChars() {
			const boardStr = 'HNO@HPQ@BBCCIJAAIJAAAA';
			verifyBoard(boardStr);
		}
		expect(boardMoreChars).toThrow();
		expect(boardLessChars).toThrow();
		expect(boardDuplicateChars).toThrow();
	});

	test('boardCharIndexArr2Key', () => {
		const boardCharIndexArr = convertBoardStr2BoardCharIndexArr(
			'HNO@HPQ@BBCCIJAAIJAA'
		);
		const boardKey = boardCharIndexArr2Key(boardCharIndexArr);
		expect(boardKey).toBe(1296740350);
		const boardMirrorKey = boardCharIndexArr2Key(boardCharIndexArr, true);
		expect(boardMirrorKey).toBe(1903865852);
	});

	test('key2BoardStringArr', () => {
		const key = -22858957767;
		const boardStringArray = key2BoardStringArr(key);
		expect(boardStringArray.join('')).toBe('CCBBKONJKAAJIAAHI@@H');
	});
});
