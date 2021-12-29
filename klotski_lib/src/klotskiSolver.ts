/*
 * @Author: zhupengfei
 * @Date: 2021-12-16 19:56:03
 * @LastEditTime: 2021-12-17 17:49:40
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski_lib/src/klotskiSolver.ts
 */
//-----------
// define

import HashMap from './common/structure/hashMap';
import Queue from './common/structure/queue';
import { gBlockCheck, gBoard2Key, gEasyBoard } from './klotskiHelper';
import {
	gBlockBelongTo,
	gBlockStyle,
	gGoalPos,
	G_BOARD_X,
	G_BOARD_Y,
	G_EMPTY_BLOCK,
	G_GOAL_BLOCK,
} from './klotskiSetting';

//-----------
const MOVE_MODE = { RIGHT_ANGLE_TURN: 1, STRAIGHT: 2, ONE_CELL_ONLY: 3 };
const SKIP_MIRROR_STATE = true;

export default class KlotskiSolution {
	// private moveMode = MOVE_MODE.RIGHT_ANGLE_TURN;
	private moveMode = MOVE_MODE.STRAIGHT;
	private queue: Queue | null = null;
	private hashMap: HashMap | null = null;
	private initBoard: any;
	private exploreCount: number = 0;
	private emptyCount: number | undefined = 0;
	private wrongBoard: number = 0;

	private reachGoal(curBoard: number[]) {
		for (let i = 0; i < gGoalPos.length; ++i) {
			const index = gGoalPos[i][0] + gGoalPos[i][1] * G_BOARD_X;
			if (curBoard[index] !== G_GOAL_BLOCK) return false;
		}
		return true;
	}

	//------------------------------------------------------------
	//add new state to queue and hashmap if does not exist before
	//------------------------------------------------------------
	private statePropose(boardObj: any, parentKey: number): number {
		if (this.hashMap!.put(boardObj.key, parentKey) === null) {
			if (SKIP_MIRROR_STATE) {
				//don't calculate left-right mirror state
				const curMirrorKey = gBoard2Key(boardObj.board, 1);
				this.hashMap!.put(curMirrorKey, parentKey);
			}
			//no any state same as current, add it
			this.queue!.add({ board: boardObj.board.slice(0), key: boardObj.key });
			return 1;
		}
		return 0;
	}

	//------------------------------------------------------
	// how many spaces or block there are (origin excluded)
	//------------------------------------------------------
	private countLengthX(
		board: any,
		posX: number,
		posY: number,
		directionX: number,
		block: any
	) {
		let step = -1;
		do {
			step++;
			posX += directionX;
		} while (
			posX >= 0 &&
			posX < G_BOARD_X &&
			board[posX + posY * G_BOARD_X] == block
		);
		return step;
	}

	private countLengthY(
		board: any,
		posX: number,
		posY: number,
		directionY: number,
		block: any
	) {
		let step = -1;
		do {
			step++;
			posY += directionY;
		} while (
			posY >= 0 &&
			posY < G_BOARD_Y &&
			board[posX + posY * G_BOARD_X] === block
		);
		return step;
	}

	//---------------------------------------------------
	// slide empty-cell up or down by directionY (-1 or 1)
	//
	// directionY: 1: empty down (block up), -1: empty up (block down)
	//
	// return how many new state created
	//
	//---------------------------------------------------
	private slideVertical(
		boardObj: any,
		parentKey: number,
		emptyX: number,
		emptyY: number,
		directionY: number,
		maxMove: number
	) {
		let blockX, blockY; //block position (x,y)
		let blockValue; //block value
		let styleIndex; //index of block style
		let blockSizeX, blockSizeY; //block style
		let curBoard = boardObj.board;

		//Find the block
		blockX = emptyX;
		blockY = emptyY + directionY;
		if (blockY < 0 || blockY >= G_BOARD_Y) return 0; //out of range

		if ((blockValue = curBoard[blockX + blockY * G_BOARD_X]) <= G_EMPTY_BLOCK)
			return 0; //empty
		blockSizeX = gBlockStyle[gBlockBelongTo[blockValue]][0]; //block size X
		blockSizeY = gBlockStyle[gBlockBelongTo[blockValue]][1]; //block size Y

		//Begin vertical move ------------------

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
		let minBlockX =
			blockX - this.countLengthX(curBoard, blockX, blockY, -1, blockValue);
		let maxBlockX = minBlockX + blockSizeX - 1;

		let stateCount = 0;
		let boardCopied = 0;
		let childBoard, childObj;
		let curKey;

		do {
			//--------------------------------------------------------------------------
			// calculate the space min-X and max-X of next position
			//--------------------------------------------------------------------------

			//minimum space position X = current space position X - count of left space
			let minSpaceX =
				emptyX - this.countLengthX(curBoard, emptyX, emptyY, -1, G_EMPTY_BLOCK);

			//maximum space position X = current space position X + count of right space
			let maxSpaceX =
				emptyX + this.countLengthX(curBoard, emptyX, emptyY, +1, G_EMPTY_BLOCK);

			//block left-right (X) range must less or equal to left-right (X) space size
			if (minBlockX < minSpaceX || maxBlockX > maxSpaceX) return stateCount;

			if (!boardCopied) {
				//first time, copy board array & set curKey
				childBoard = curBoard.slice(0);
				curKey = boardObj.key;
				boardCopied = 1;
			}

			//slide empty-block up|down
			for (var x = minBlockX; x <= maxBlockX; x++) {
				childBoard[x + emptyY * G_BOARD_X] = blockValue;
				childBoard[x + (emptyY + blockSizeY * directionY) * G_BOARD_X] =
					G_EMPTY_BLOCK;
			}

			childObj = { board: childBoard, key: gBoard2Key(childBoard) };
			if (parentKey != 0) {
				//-----------------------------------------------
				// parentKey != 0 means move more than one step
				//-----------------------------------------------
				stateCount += this.statePropose(childObj, parentKey);
			} else {
				stateCount += this.statePropose(childObj, curKey);
				parentKey = curKey;
			}

			{
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
					this.moveMode == MOVE_MODE.RIGHT_ANGLE_TURN &&
					maxMove < this.emptyCount!
				) {
					if (minSpaceX < minBlockX && minBlockX == emptyX) {
						//slide block left
						stateCount += this.slideHorizontal(
							childObj,
							parentKey,
							emptyX - 1,
							emptyY,
							+1,
							maxMove + 1
						);
					}
					if (maxSpaceX > maxBlockX && maxBlockX == emptyX) {
						//slide block right
						stateCount += this.slideHorizontal(
							childObj,
							parentKey,
							emptyX + 1,
							emptyY,
							-1,
							maxMove + 1
						);
					}
				}
			}

			emptyY -= directionY;
		} while (
			this.moveMode != MOVE_MODE.ONE_CELL_ONLY &&
			emptyY >= 0 &&
			emptyY < G_BOARD_Y &&
			childBoard[emptyX + emptyY * G_BOARD_X] == G_EMPTY_BLOCK
		);

		return stateCount;
	}

	//---------------------------------------------------
	// slide empty-cell left or right by directionX (-1 or 1)
	//
	// directionX: 1: empty right (block left), -1: empty right (block left)
	//
	// return how many new state created
	//---------------------------------------------------
	private slideHorizontal(
		boardObj: any,
		parentKey: number,
		emptyX: number,
		emptyY: number,
		directionX: number,
		maxMove: number
	) {
		var blockX, blockY; //block position (x,y)
		var blockValue; //block value
		var styleIndex; //index of block style
		var blockSizeX, blockSizeY; //block style
		var curBoard = boardObj.board;

		//Find the block
		blockX = emptyX + directionX;
		if (blockX < 0 || blockX >= G_BOARD_X) return 0; //out of range

		blockY = emptyY;

		if ((blockValue = curBoard[blockX + blockY * G_BOARD_X]) <= G_EMPTY_BLOCK)
			return 0; //empty
		blockSizeX = gBlockStyle[gBlockBelongTo[blockValue]][0]; //block size X
		blockSizeY = gBlockStyle[gBlockBelongTo[blockValue]][1]; //block size Y

		//Begin horizontal move ------------------

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
		var minBlockY =
			blockY - this.countLengthY(curBoard, blockX, blockY, -1, blockValue);
		var maxBlockY = minBlockY + blockSizeY - 1;

		var stateCount = 0;
		var boardCopied = 0;
		var childBoard, childObj;
		var curKey;

		do {
			//--------------------------------------------------------------------------
			// calculate the space min-X and max-X of next position
			//--------------------------------------------------------------------------

			//minimum space position Y = current space position Y - count of up space
			var minSpaceY =
				emptyY - this.countLengthY(curBoard, emptyX, emptyY, -1, G_EMPTY_BLOCK);

			//maximum space position X = current space position X + count of right space
			var maxSpaceY =
				emptyY + this.countLengthY(curBoard, emptyX, emptyY, +1, G_EMPTY_BLOCK);

			//block up-down (Y) range must less or equal to up-down (Y) space size
			if (minBlockY < minSpaceY || maxBlockY > maxSpaceY) return stateCount;

			if (!boardCopied) {
				//first time, copy board array & set curKey
				childBoard = curBoard.slice(0);
				curKey = boardObj.key;
				boardCopied = 1;
			}

			//slide empty-block left|right
			for (var y = minBlockY; y <= maxBlockY; y++) {
				childBoard[emptyX + y * G_BOARD_X] = blockValue;
				childBoard[emptyX + blockSizeX * directionX + y * G_BOARD_X] =
					G_EMPTY_BLOCK;
			}

			childObj = { board: childBoard, key: gBoard2Key(childBoard) };
			if (parentKey != 0) {
				//-----------------------------------------------
				// parentKey != 0 means move more than one step
				//-----------------------------------------------
				stateCount += this.statePropose(childObj, parentKey);
			} else {
				stateCount += this.statePropose(childObj, curKey);
				parentKey = curKey;
			}

			{
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
					this.moveMode == MOVE_MODE.RIGHT_ANGLE_TURN &&
					maxMove < this.emptyCount!
				) {
					if (minSpaceY < minBlockY && minBlockY == emptyY) {
						//slide block up (empty down)
						stateCount += this.slideVertical(
							childObj,
							parentKey,
							emptyX,
							emptyY - 1,
							+1,
							maxMove + 1
						);
					}
					if (maxSpaceY > maxBlockY && maxBlockY == emptyY) {
						//slide block down (empty up)
						stateCount += this.slideVertical(
							childObj,
							parentKey,
							emptyX,
							emptyY + 1,
							-1,
							maxMove + 1
						);
					}
				}
			}
			emptyX -= directionX;
		} while (
			this.moveMode != MOVE_MODE.ONE_CELL_ONLY &&
			emptyX >= 0 &&
			emptyX < G_BOARD_X &&
			childBoard[emptyX + emptyY * G_BOARD_X] == G_EMPTY_BLOCK
		);

		return stateCount;
	}

	//--------------------------------------------------------
	// Using recursion to trace the steps from button to top
	// then put the key value to array
	//--------------------------------------------------------
	private getAnswerList(curKey: number, boardList: any) {
		var keyMap = this.hashMap!.get(curKey); //{ key: curKey, value: parentKey }

		if (keyMap.value) this.getAnswerList(keyMap.value, boardList);
		boardList.push(curKey);
	}

	//---------------------------------------------
	// for all empty block to find the next state
	//---------------------------------------------
	private explore(boardObj: any) {
		var stateCount = 0; //how many new state created
		var eCount = 0; //empty count

		breakLoop: for (var emptyX = 0; emptyX < G_BOARD_X; emptyX++) {
			for (var emptyY = 0; emptyY < G_BOARD_Y; emptyY++) {
				if (boardObj.board[emptyX + emptyY * G_BOARD_X] != G_EMPTY_BLOCK)
					continue;
				eCount++;

				//slide empty up ==> block down
				stateCount += this.slideVertical(boardObj, 0, emptyX, emptyY, -1, 0); //block at Y-1

				//slide empty down ==> block up
				stateCount += this.slideVertical(boardObj, 0, emptyX, emptyY, +1, 0); //block at Y+1

				//slide empty left ==> block right
				stateCount += this.slideHorizontal(boardObj, 0, emptyX, emptyY, -1, 0); //block at X-1

				//slide empty right ==> block left
				stateCount += this.slideHorizontal(boardObj, 0, emptyX, emptyY, +1, 0); //block at X+1
				if (eCount >= this.emptyCount!) break breakLoop;
			}
		}
		return stateCount;
	}

	public init(boardString: string, boardMoveMode?: any) {
		var result = gBlockCheck(boardString);
		if (result.rc) {
			this.wrongBoard = 1;
			return;
		}

		this.emptyCount = result.emptyCount;
		this.wrongBoard = 0;

		if (typeof boardMoveMode != 'undefined') {
			switch (boardMoveMode) {
				case MOVE_MODE.ONE_CELL_ONLY:
					this.moveMode = MOVE_MODE.ONE_CELL_ONLY;
					break;
				case MOVE_MODE.STRAIGHT:
					this.moveMode = MOVE_MODE.STRAIGHT;
					break;
				default:
				case MOVE_MODE.RIGHT_ANGLE_TURN:
					this.moveMode = MOVE_MODE.RIGHT_ANGLE_TURN;
					break;
			}
		}

		this.queue = new Queue(); //queue for breadth first search
		this.hashMap = new HashMap(); //hash maps for current state to parent state & collision detection

		this.initBoard = gEasyBoard(boardString);
	}

	//-----------------------------------
	// public function : find the answer
	//-----------------------------------
	public find() {
		let boardList: number[] = [];

		if (this.wrongBoard) {
			return { exploreCount: 0, elapsedTime: 0, boardList: null };
		}
		const startTime = Date.now();

		//Put the initial state to BFS queue & hash map
		this.statePropose(
			{ board: this.initBoard, key: gBoard2Key(this.initBoard) },
			0
		);
		this.exploreCount = 1; //initial state

		while (this.queue!.size() > 0) {
			let boardObj = this.queue!.remove();

			if (this.reachGoal(boardObj.board)) {
				boardList = [];
				this.getAnswerList(boardObj.key, boardList);
				break; //find a solution
			}
			this.exploreCount += this.explore(boardObj); //find next board state
		}
		const endTime = Date.now();

		// delete Q;
		// delete H;

		//TODO: 考虑是否调用清空方法再置为null
		this.queue = null;
		this.hashMap = null;
		return {
			exploreCount: this.exploreCount,
			elapsedTime: (endTime - startTime) / 1000,
			boardList: boardList,
		};
	}
}
