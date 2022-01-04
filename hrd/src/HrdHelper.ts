//--------------------------------------------------------------------
// board string convert to board array with gBlockBelongTo index value
//--------------------------------------------------------------------

import {
	BLOCK_INDEX_LIST,
	BLOCK_TYPE_LIST,
	BOARD_SIZE,
	EMPTY_BLOCK_COUNT,
	EMPTY_CHAR,
	GOAL_BLOCK_INDEX,
	VOID_CHAR,
} from './configs/HrdConfigs';

export function convertBoardStr2BoardCharIndexArr(boardStr: string): number[] {
	const boardStrArr = boardStr.split('');
	const boardArr = boardStrArr.map(
		(v) => v.charCodeAt(0) - VOID_CHAR.charCodeAt(0)
	);
	return boardArr;
}
//----------------------------------------------------
// convert row major 2 diamonion to 1 diamonion index
//----------------------------------------------------

export function convertBoardPos2Index(row: number, col: number) {
	return col + row * BOARD_SIZE[1];
}

// 获取划块的大小
export function getBlockSize(charIndex: number): number[] {
	return BLOCK_TYPE_LIST[BLOCK_INDEX_LIST[charIndex]];
}

//---------------------------------------
// board verify
//
// return emptyCount for maximum deep check
//---------------------------------------
export function verifyBoard(boardStr: string) {
	const tmpBoard = boardStr.split('');
	const [totalRow, totalCol] = BOARD_SIZE;
	let emptyCount = 0;
	let checkedCharIndexList = [];
	for (let i = 0; i < totalRow; ++i) {
		for (let j = 0; j < totalCol; ++j) {
			const blockIndex = convertBoardPos2Index(i, j);
			const blockChar = tmpBoard[blockIndex];
			if (blockChar === '0') continue; //已计算过，直接pass
			const blockCharIndex = blockChar.charCodeAt(0) - VOID_CHAR.charCodeAt(0);
			const [blockSizeR, blockSizeC] = getBlockSize(blockCharIndex);
			for (let r = 0; r < blockSizeR; ++r) {
				if (r + i >= totalRow)
					throw new Error(`wrong block at row:${i},col:${j}`);
				for (let c = 0; c < blockSizeC; ++c) {
					if (c + j >= totalCol)
						throw new Error(`wrong block at row:${i},col:${j}`);
					const index = convertBoardPos2Index(r + i, c + j);
					if (tmpBoard[index] !== blockChar)
						throw new Error(`wrong block at row:${i},col:${j}`);
					tmpBoard[index] = '0';
				}
			}
			if (blockChar === EMPTY_CHAR) emptyCount++;
			if (checkedCharIndexList.includes(blockCharIndex))
				throw new Error(`duplicate block at row:${i},col:${j}`);
			checkedCharIndexList.push(blockCharIndex);
		}
		if (emptyCount > EMPTY_BLOCK_COUNT)
			throw new Error('too many empty block!');
	}
}

//---------------------------------------------------------
// transfer the board to 64 bits int
// one char convert to 2 bits
//
// javascript: They are 64-bit floating point values,
//             the largest exact integral value is 2 ^ 53
//             but bitwise/shifts only operate on int32
//
// add support key for left-right mirror, 09/02/2017
//---------------------------------------------------------
export function boardCharIndexArr2Key(
	boardCharIndexArr: number[],
	mirror: boolean = false
): number {
	let invBase = 0;
	let primeBlockPos = -1;
	let boardKey = 0;
	if (mirror) invBase = -(BOARD_SIZE[1] + 1);
	for (let i = 0, len = boardCharIndexArr.length; i < len; ++i) {
		//---------------------------------------------------------------------
		// Javascript only support 53 bits integer	(64 bits floating)
		// for save space, one cell use 2 bits
		// and only keep the position of prime minister block (曹操)
		//---------------------------------------------------------------------
		// maxmum length = (4 * 5 - 4) * 2 + 4
		//               = 32 + 4 = 36 bits
		//
		// 4 * 5 : max cell
		// - 4   : prime minister block size
		// * 2   : one cell use 2 bits
		// + 4   : prime minister block position use 4 bits
		//---------------------------------------------------------------------

		if (i % BOARD_SIZE[1] === 0) invBase += BOARD_SIZE[1] * 2; //key for mirror board
		const blockCharIndex = mirror
			? boardCharIndexArr[invBase - i]
			: boardCharIndexArr[i];
		if (blockCharIndex === GOAL_BLOCK_INDEX) {
			if (primeBlockPos < 0) primeBlockPos = i;
			continue;
		}
		boardKey = (boardKey << 2) + BLOCK_INDEX_LIST[blockCharIndex];
	}
	boardKey = (boardKey << 4) + primeBlockPos;
	return boardKey;
}
