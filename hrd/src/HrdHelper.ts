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
			else if (checkedCharIndexList.includes(blockCharIndex))
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
		// const blockCharIndex = mirror
		// 	? boardCharIndexArr[invBase - i]
		// 	: boardCharIndexArr[i];
		const blockCharIndex = boardCharIndexArr[mirror ? invBase - i : i];
		if (blockCharIndex === GOAL_BLOCK_INDEX) {
			if (primeBlockPos < 0) primeBlockPos = i;
			continue;
		}
		boardKey = (boardKey << 2) + BLOCK_INDEX_LIST[blockCharIndex];
	}
	boardKey = boardKey * 16 + primeBlockPos;
	return boardKey;
}

//-------------------------------------------------
// convert integer board key to board value
// with different char value of same block style
// for draw board
//-------------------------------------------------
export function key2BoardStringArr(key: number): string[] {
	const blockChars = ['@', 'N', 'B', 'H', 'A'];
	const primeBlockPos: number = key & 0x0f; //position of prime minister block (曹操), 4 bits
	let boardStringArr: string[] = [];
	//set prime minister block
	boardStringArr[primeBlockPos] = blockChars[4];
	boardStringArr[primeBlockPos + 1] = blockChars[4];
	boardStringArr[primeBlockPos + BOARD_SIZE[1]] = boardStringArr[4];
	boardStringArr[primeBlockPos + BOARD_SIZE[1] + 1] = boardStringArr[4];

	key = Math.floor(key / 16); //shift >> 4 bits
	let blockTypeIndex: number;
	//倒序
	for (let i = BOARD_SIZE[0] * BOARD_SIZE[1]; i >= 0; --i) {
		if (boardStringArr[i] === blockChars[4]) continue;
		blockTypeIndex = key & 0x03; //2 bits
		key >>= 2; //shift >> 2 bits, now the value <= 32 bits can use bitwise operator
		if (boardStringArr[i]) continue;
		switch (blockTypeIndex) {
			case 0: // empty block
				boardStringArr[i] = blockChars[0];
				break;
			case 1: //1*1
				boardStringArr[i] = blockChars[1];
				blockChars[1] = String.fromCharCode(blockChars[1].charCodeAt(0) + 1); //ascii + 1
				break;
			case 2: //1*2
				boardStringArr[i] = blockChars[2];
				boardStringArr[i - 1] = blockChars[2];
				blockChars[2] = String.fromCharCode(blockChars[2].charCodeAt(0) + 1); //ascii + 1
				break;
			case 3: //2*1
				boardStringArr[i] = blockChars[3];
				boardStringArr[i - BOARD_SIZE[1]] = blockChars[3];
				blockChars[3] = String.fromCharCode(blockChars[3].charCodeAt(0) + 1); //ascii + 1
				break;
			case 4: //2*2
			default:
				throw new Error('design error');
			// break;
		}
	}
	return boardStringArr;
}
