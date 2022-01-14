import HashTable from './algorithm/data-structures/hash-table/HashTable';
import Queue from './algorithm/data-structures/queue/Queue';
import {
	BOARD_SIZE,
	EMPTY_BLOCK_COUNT,
	EMPTY_BLOCK_CHAR_INDEX,
	GOAL_BLOCK_INDEX,
	GOAL_POS,
	MIRROR_STATUS,
	MOVE_MODE,
} from './configs/HrdConfigs';
import {
	boardCharIndexArr2Key,
	convertBoardPos2Index,
	convertBoardStr2BoardCharIndexArr,
	getBlockSize,
	verifyBoard,
} from './HrdHelper';
import { BoardObj } from './interface/IHrd';

export default class Hrd {
	private _moveMode: MOVE_MODE = MOVE_MODE.RIGHT_ANGLE_TURN;
	private _initBoard: number[] = []; //charIndexArr
	private _queue: Queue | null = null;
	private _hashTable: HashTable | null = null;
	// public _logkey: string = '';

	public init(boardStr: string, boardMoveMode?: MOVE_MODE) {
		try {
			verifyBoard(boardStr);
		} catch (error) {
			console.error(error);
		}
		boardMoveMode && (this._moveMode = boardMoveMode);
		this._initBoard = convertBoardStr2BoardCharIndexArr(boardStr);
		// [3, 3, 4, 4, 9, 15, 16, 10, 9, 2, 2, 10, 11, 2, 2, 12, 11, 1, 1, 12];
		this._queue = new Queue();
		this._hashTable = new HashTable();
	}

	//------------------------------------------------------------
	//add new state to queue and hashmap if does not exist before
	//------------------------------------------------------------
	public statePropose(boardObj: BoardObj, parentKey: number): number {
		const { key, board } = boardObj;
		if (this._hashTable?.has(`${key}`)) return 0; //已存在
		this._hashTable?.set(`${key}`, parentKey);
		if (MIRROR_STATUS) {
			const currentMirrorKey = boardCharIndexArr2Key(board, true);
			if (!this._hashTable?.has(`${currentMirrorKey}`)) {
				this._hashTable?.set(`${currentMirrorKey}`, parentKey);
			}
		}
		// this._logkey += `=>${key}`;
		// this.printBoard(board, key);
		this._queue?.enqueue({ board: board.slice(), key });
		return 1;
	}

	public reachGoal(boardCharIndexArr: number[]): boolean {
		return GOAL_POS.every((v) => {
			const [row, col] = v;
			const index = convertBoardPos2Index(row, col);
			return boardCharIndexArr[index] === GOAL_BLOCK_INDEX;
		});
	}

	public find() {
		const startTime = Date.now();
		let boardList: number[] = [];
		const boardKey = boardCharIndexArr2Key(this._initBoard);
		//Put the initial state to BFS queue & hash map
		this.statePropose({ board: this._initBoard, key: boardKey }, 0);
		let exploreCount = 1;
		while (!this._queue?.isEmpty()) {
			const boardObj = this._queue?.dequeue() as BoardObj;
			if (this.reachGoal(boardObj.board)) {
				this.getAnswerList(boardObj.key, boardList);
				break;
			}
			exploreCount += this.explore(boardObj);
		}
		const endTime = Date.now();
		this._hashTable = null;
		this._queue = null;

		return {
			exploreCount,
			elapsedTime: (endTime - startTime) / 1000,
			boardList,
		};
	}

	//--------------------------------------------------------
	// Using recursion to trace the steps from button to top
	// then put the key value to array
	//--------------------------------------------------------
	public getAnswerList(curKey: number, board: number[]) {
		const value = this._hashTable?.get(`${curKey}`);
		if (value) this.getAnswerList(value, board);
		board.push(curKey);
	}

	public explore(boardObj: BoardObj): number {
		let emptyCount = 0;
		let stateCount = 0;
		for (let i = 0; i < BOARD_SIZE[0]; ++i) {
			for (let j = 0; j < BOARD_SIZE[1]; ++j) {
				const { board, key } = boardObj;
				if (board[convertBoardPos2Index(i, j)] !== EMPTY_BLOCK_CHAR_INDEX)
					continue;
				emptyCount++;
				//slide empty up ==> block down
				stateCount += this.slideVertical(boardObj, 0, i, j, -1, 0); //block at Y-1

				//slide empty down ==> block up
				stateCount += this.slideVertical(boardObj, 0, i, j, +1, 0); //block at Y+1

				//slide empty left ==> block right
				stateCount += this.slideHorizontal(boardObj, 0, i, j, -1, 0); //block at X-1

				//slide empty right ==> block left
				stateCount += this.slideHorizontal(boardObj, 0, i, j, +1, 0); //block at X+1
				if (emptyCount >= EMPTY_BLOCK_COUNT) break;
			}
		}
		return stateCount;
	}

	//---------------------------------------------------
	// slide empty-cell up or down by directionY (-1 or 1)
	//
	// directionY: 1: empty down (block up), -1: empty up (block down)
	//
	// return how many new state created
	//
	//---------------------------------------------------
	/**
	 *
	 * @param boardObj
	 * @param parentKey
	 * @param emptyBlockR
	 * @param emptyBlockC
	 * @param direction emptyblock的移动方向，1下，-1上
	 * @param maxMove
	 */
	public slideVertical(
		boardObj: BoardObj,
		parentKey: number,
		emptyBlockR: number,
		emptyBlockC: number,
		direction: number,
		maxMove: number
	) {
		const [blockR, blockC] = [emptyBlockR + direction, emptyBlockC];
		if (blockR < 0 || blockR >= BOARD_SIZE[0]) return 0;
		const { board, key } = boardObj;
		const index = convertBoardPos2Index(blockR, blockC);
		const blockCharIndex = board[index];
		// const blockTypeIndex = BLOCK_INDEX_LIST[blockCharIndex];
		if (blockCharIndex <= EMPTY_BLOCK_CHAR_INDEX) return 0;
		const [blockSizeR, blockSizeC] = getBlockSize(blockCharIndex);
		const minBlockC =
			blockC - this.countLengthC(board, blockR, blockC, -1, blockCharIndex);
		const maxBlockC = minBlockC + blockSizeC - 1;
		let stateCount = 0;
		//----------------------------------------------------------------
		// block slide up|down: must block size X can slide to empty space
		//
		//   min-X <---- empty space ----> max-X
		//
		//           +--------------+
		//           |              |
		//           +--------------+
		//     min-X <---- block ---> max-X
		//
		//   minBlockX must >= minSpaceX && maxBlockX must <= maxSpaceX
		//-----------------------------------------------------------------

		//--------------------------------------------------------------------------
		// find the block min-X and max-X
		// minimum block position X = current block position X - count of left block
		//--------------------------------------------------------------------------
		// let curBoard: number[] = [];
		const curBoard = board.slice();
		const curKey = key;
		do {
			const minSpaceC =
				emptyBlockC -
				this.countLengthC(
					board,
					emptyBlockR,
					emptyBlockC,
					-1,
					EMPTY_BLOCK_CHAR_INDEX
				);
			const maxSpaceC =
				emptyBlockC +
				this.countLengthC(
					board,
					emptyBlockR,
					emptyBlockC,
					1,
					EMPTY_BLOCK_CHAR_INDEX
				);
			if (minBlockC < minSpaceC || maxBlockC > maxSpaceC) return stateCount;

			//slide empty-block up|down
			for (let i = minBlockC; i <= maxBlockC; ++i) {
				curBoard[convertBoardPos2Index(emptyBlockR, i)] = blockCharIndex;
				curBoard[
					convertBoardPos2Index(emptyBlockR + blockSizeR * direction, i)
				] = EMPTY_BLOCK_CHAR_INDEX;
			}
			const boardKey = boardCharIndexArr2Key(curBoard);
			const childObj: BoardObj = {
				board: curBoard,
				key: boardKey,
			};
			if (parentKey !== 0) {
				//-----------------------------------------------
				// parentKey != 0 means move more than one step
				//-----------------------------------------------
				stateCount += this.statePropose(childObj, parentKey);
			} else {
				stateCount += this.statePropose(childObj, curKey);
				parentKey = curKey;
			}
			//---------------------------------------------------------------------------------
			// only for one size block:
			// for more than one step and move to different direction (vertical to horizontal)
			//
			//
			//   +---+---+      +---+---+
			//   | E   E |      | E | B |
			//   +---+---+  ==> +   +---+
			//   | B |          | E |
			//   +---+          +---+
			//---------------------------------------------------------------------------------
			if (
				this._moveMode === MOVE_MODE.RIGHT_ANGLE_TURN &&
				maxMove < EMPTY_BLOCK_COUNT
			) {
				if (minSpaceC < minBlockC && minBlockC === emptyBlockC) {
					//slide block left
					stateCount += this.slideHorizontal(
						childObj,
						parentKey,
						emptyBlockR,
						emptyBlockC - 1,
						1,
						maxMove + 1
					);
				}
				if (maxSpaceC > maxBlockC && maxBlockC === emptyBlockC) {
					//slide block right
					stateCount += this.slideHorizontal(
						childObj,
						parentKey,
						emptyBlockR,
						emptyBlockC + 1,
						-1,
						maxMove + 1
					);
				}
			}
			emptyBlockR -= direction;
		} while (
			this._moveMode !== MOVE_MODE.ONE_CELL_ONLY &&
			emptyBlockR >= 0 &&
			emptyBlockR < BOARD_SIZE[0] &&
			curBoard[convertBoardPos2Index(emptyBlockR, emptyBlockC)] ===
				EMPTY_BLOCK_CHAR_INDEX
		);
		return stateCount;
	}
	//---------------------------------------------------
	// slide empty-cell left or right by directionX (-1 or 1)
	//
	// directionX: 1: empty right (block left), -1: empty left (block right)
	//
	// return how many new state created
	//---------------------------------------------------
	public slideHorizontal(
		boardObj: BoardObj,
		parentKey: number,
		emptyBlockR: number,
		emptyBlockC: number,
		direction: number,
		maxMove: number
	): number {
		const [blockR, blockC] = [emptyBlockR, emptyBlockC + direction];
		if (blockC < 0 || blockC >= BOARD_SIZE[1]) return 0;
		const { board, key } = boardObj;
		const index = convertBoardPos2Index(blockR, blockC);
		const blockCharIndex = board[index];
		// const blockTypeIndex = BLOCK_INDEX_LIST[blockCharIndex];
		if (blockCharIndex <= EMPTY_BLOCK_CHAR_INDEX) return 0;
		const [blockSizeR, blockSizeC] = getBlockSize(blockCharIndex);
		const minBlockR =
			blockR - this.countLengthR(board, blockR, blockC, -1, blockCharIndex);
		const maxBlockR = minBlockR + blockSizeR - 1;
		let stateCount = 0;
		//--------------------------------------------------------------------
		// block slide left|right: must block size Y can slide to empty space
		//
		//   min-X <---- empty space ----> max-X
		//
		//    --+-- min-Y
		//      |          +---+   --+-- min-Y
		//      |          |   |     |
		//  empty space    |   |   block
		//      |          |   |     |
		//      |          +---+   --+-- max-Y
		//    --+-- max-Y
		//
		//   minBlockY must >= minSpaceY && maxBlockY must <= maxSpaceY
		//---------------------------------------------------------------------

		//--------------------------------------------------------------------------
		// find the block min-Y and max-Y
		// minimum block position Y = current block position Y - count of up block
		//--------------------------------------------------------------------------
		const curBoard = board.slice();
		const curKey = key;
		do {
			const minSpaceR =
				emptyBlockR -
				this.countLengthR(
					board,
					emptyBlockR,
					emptyBlockC,
					-1,
					EMPTY_BLOCK_CHAR_INDEX
				);
			const maxSpaceR =
				emptyBlockR +
				this.countLengthR(
					board,
					emptyBlockR,
					emptyBlockC,
					1,
					EMPTY_BLOCK_CHAR_INDEX
				);
			if (minBlockR < minSpaceR || maxBlockR > maxSpaceR) return stateCount;
			//slide empty-block left|right
			for (let i = minBlockR; i <= maxBlockR; ++i) {
				curBoard[convertBoardPos2Index(i, emptyBlockC)] = blockCharIndex;
				curBoard[
					convertBoardPos2Index(i, emptyBlockC + blockSizeC * direction)
				] = EMPTY_BLOCK_CHAR_INDEX;
			}
			const boardKey = boardCharIndexArr2Key(curBoard);
			const childObj: BoardObj = {
				board: curBoard,
				key: boardKey,
			};
			if (parentKey !== 0) {
				//-----------------------------------------------
				// parentKey != 0 means move more than one step
				//-----------------------------------------------
				stateCount += this.statePropose(childObj, parentKey);
			} else {
				stateCount += this.statePropose(childObj, curKey);
				parentKey = curKey;
			}
			//---------------------------------------------------------------------------------
			// only for one size block:
			// for more than one step and move to different direction (horizontal to vertical)
			//
			//
			//       +---+          +---+
			//       | E |          | B |
			//   +---+   +  ==> +---+---+
			//   | B | E |      | E   E |
			//   +---+---+      +---+---+
			//---------------------------------------------------------------------------------
			if (
				this._moveMode === MOVE_MODE.RIGHT_ANGLE_TURN &&
				maxMove < EMPTY_BLOCK_COUNT
			) {
				if (minSpaceR < minBlockR && minBlockR === emptyBlockR) {
					//slide block up
					stateCount += this.slideVertical(
						childObj,
						parentKey,
						emptyBlockR - 1,
						emptyBlockC,
						1,
						maxMove + 1
					);
				}
				if (maxSpaceR > maxBlockR && maxBlockR === emptyBlockR) {
					//slide block down
					stateCount += this.slideVertical(
						childObj,
						parentKey,
						emptyBlockR + 1,
						emptyBlockC,
						-1,
						maxMove + 1
					);
				}
			}
			emptyBlockC -= direction;
		} while (
			this._moveMode !== MOVE_MODE.ONE_CELL_ONLY &&
			emptyBlockC >= 0 &&
			emptyBlockC < BOARD_SIZE[1] &&
			curBoard[convertBoardPos2Index(emptyBlockR, emptyBlockC)] ===
				EMPTY_BLOCK_CHAR_INDEX
		);
		return stateCount;
	}

	//------------------------------------------------------
	// how many spaces or block there are (origin excluded)
	//------------------------------------------------------

	public countLengthC(
		board: number[],
		row: number,
		col: number,
		directionC: -1 | 1,
		blockCharIndex: number
	): number {
		let step = -1;

		do {
			step++;
			col += directionC;
		} while (
			col >= 0 &&
			col < BOARD_SIZE[1] &&
			board[convertBoardPos2Index(row, col)] === blockCharIndex
		);

		return step;
	}

	public countLengthR(
		board: number[],
		row: number,
		col: number,
		directionR: -1 | 1,
		blockCharIndex: number
	): number {
		let step = -1;
		do {
			step++;
			row += directionR;
		} while (
			row >= 0 &&
			row < BOARD_SIZE[0] &&
			board[convertBoardPos2Index(row, col)] === blockCharIndex
		);
		return step;
	}

	public printBoard(boardCharIndexArr: number[], key: number) {
		const a = `key: ${key}
		${boardCharIndexArr[0]},	${boardCharIndexArr[1]},	${boardCharIndexArr[2]},	${boardCharIndexArr[3]},
		${boardCharIndexArr[4]},	${boardCharIndexArr[5]},	${boardCharIndexArr[6]},	${boardCharIndexArr[7]},
		${boardCharIndexArr[8]},	${boardCharIndexArr[9]},	${boardCharIndexArr[10]},	${boardCharIndexArr[11]},
		${boardCharIndexArr[12]},	${boardCharIndexArr[13]},	${boardCharIndexArr[14]},	${boardCharIndexArr[15]},
		${boardCharIndexArr[16]},	${boardCharIndexArr[17]},	${boardCharIndexArr[18]},	${boardCharIndexArr[19]}
		`;
		console.log('a :>> ', a);
	}
}
