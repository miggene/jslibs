/*
 * @Author: zhupengfei
 * @Date: 2021-12-17 16:35:39
 * @LastEditTime: 2021-12-17 17:25:39
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski_lib/src/klotskiPuzzle.ts
 */

import {
	gBlockBelongTo,
	gBlockStyle,
	G_BOARD_X,
	G_BOARD_Y,
} from './klotskiSetting';

export default class KlotskiPuzzle {
	private blockObj = [];
	private boardState: number[][] = [];
	private curBoardStep = 0;
	private stepInfo: number[] = [];
	private manualMoveCount = 0;

	private createBoard(boardString: string) {
		for (let x = 0; x < G_BOARD_X; ++x) {
			this.boardState[x] = [];
			for (let y = 0; y < G_BOARD_Y; y++) {
				this.boardState[x][y] = -1;
			}
		}
		let blockId = 1; //blockObj[0] : for empty (don't use)
		let i = 0;
		const VOID_CHAR = '?';
		for (let y = 0; y < G_BOARD_Y; y++) {
			for (let x = 0; x < G_BOARD_X; x++) {
				if (this.boardState[x][y] >= 0) {
					i++;
					continue;
				}
				var style =
					gBlockBelongTo[boardString.charCodeAt(i++) - VOID_CHAR.charCodeAt(0)];

				//don't create block for empty
				// if (style)
				// this.blockObj[blockId] = createBlock(
				// 	blockId,
				// 	x,
				// 	y,
				// 	style,
				// 	playMode == 1 ? 1 : 0
				// );

				let sizeX = gBlockStyle[style][0];
				let sizeY = gBlockStyle[style][1];
				for (let xx = 0; xx < sizeX; xx++) {
					for (let yy = 0; yy < sizeY; yy++) {
						this.boardState[x + xx][y + yy] = style ? blockId : 0; //empty id = 0;
					}
				}
				if (style) blockId++;
			}
		}
	}

	//----------------------------------------------------------
	// check all cell (x,y), (x+1,y) ...(x+size,y) are empty
	//----------------------------------------------------------
	private allCellXEmpty(x: number, y: number, size: number) {
		for (let i = 0; i < size; i++) {
			if (this.boardState[x + i][y] != 0) return 0;
		}
		return 1;
	}

	//----------------------------------------------------------
	// check all cell (x,y), (x,y+1) ...(x,y+size) are empty
	//----------------------------------------------------------
	private allCellYEmpty(x: number, y: number, size: number) {
		for (var i = 0; i < size; i++) {
			if (this.boardState[x][y + i] != 0) return 0;
		}
		return 1;
	}

	//---------------------------------------------
	// change block style value from (posX, posY)
	//---------------------------------------------
	private setBoardState(
		boardState: number[][],
		posX: number,
		posY: number,
		style: number,
		value: number
	) {
		let sizeX = gBlockStyle[style][0];
		let sizeY = gBlockStyle[style][1];

		for (let y = 0; y < sizeY; y++) {
			for (let x = 0; x < sizeX; x++) {
				boardState[posX + x][posY + y] = value;
			}
		}
	}

	//-----------------------------------------------------
	//            |1bit| 5 bit | 4 bit| 4 bit|4bit|4bit|
	// stepInfo = |auto|blockId|startX|startY|endX|endY|
	//               21|     16|    12|     8|   4|   0|
	//-----------------------------------------------------
	private stepInfo2PosInfo(stepId: number) {
		let value = this.stepInfo[stepId - 1];
		let autoPlay = (value >> 21) & 0x1;
		let blockId = (value >> 16) & 0x1f; //for work with edit mode (14 + 6 + 6 + 1 = 27 blocks for edit)
		let startX = (value >> 12) & 0xf;
		let startY = (value >> 8) & 0xf;
		let endX = (value >> 4) & 0xf;
		let endY = value & 0xf;

		return {
			id: blockId,
			startX: startX,
			startY: startY,
			endX: endX,
			endY: endY,
			auto: autoPlay,
		};
	}

	//----------------------------------------------------------------------------------
	// add new move step to stepInfo
	// (1) append will add to last
	// (2) if curBoardStep < stepInfo.length means usr press the undo button
	//        cut off remain and add new
	// (3) if auto enable (move by click hints button) will not merge with old step
	//---------------------------------------------------------------------------------

	private setStepInfo(
		id: number,
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		auto: number,
		append: boolean
	) {
		let curStep = this.stepInfo.length;
		if (startX == endX && startY == endY) return this.curBoardStep;

		if (!append && curStep > this.curBoardStep) {
			// remove undo steps
			this.stepInfo.splice(this.curBoardStep, curStep - this.curBoardStep);
			curStep = this.curBoardStep;
		}

		if (!auto && curStep != 0) {
			let lastPosInfo = this.stepInfo2PosInfo(curStep);

			if (lastPosInfo.endX == startX && lastPosInfo.endY == startY) {
				//same block with last moved
				if (lastPosInfo.startX == endX && lastPosInfo.startY == endY) {
					//same block move back to last moved
					// ==> remove last step
					this.stepInfo.pop();
					curStep--;
				} else {
					//update last step
					this.stepInfo[curStep - 1] =
						((auto ? 1 : 0) << 21) +
						(id << 16) +
						(lastPosInfo.startX << 12) +
						(lastPosInfo.startY << 8) +
						(endX << 4) +
						endY;
				}
				this.curBoardStep = curStep;
				return curStep;
			}
		}
		this.stepInfo[curStep++] =
			((auto ? 1 : 0) << 21) +
			(id << 16) +
			(startX << 12) +
			(startY << 8) +
			(endX << 4) +
			endY;

		if (!auto) {
			this.curBoardStep = curStep;
			this.manualMoveCount++; //move count for enable hints button
		}

		return curStep;
	}

	//-----------------------------------
	// move boardState to indicate step
	//-----------------------------------
	// private moveBoardState(step: number) {
	// 	if (step < 0 || step > this.stepInfo.length || step == this.curBoardStep)
	// 		return;

	// 	switch (true) {
	// 		case step < this.curBoardStep: //move back
	// 			do {
	// 				let posInfo = this.stepInfo2PosInfo(this.curBoardStep);
	// 				// var curBlock = blockObj[posInfo.id];
	// 				// var style = curBlock.getAttr('style');

	// 				this.setBoardState(
	// 					this.boardState,
	// 					posInfo.endX,
	// 					posInfo.endY,
	// 					style,
	// 					0
	// 				);
	// 				this.setBoardState(
	// 					this.boardState,
	// 					posInfo.startX,
	// 					posInfo.startY,
	// 					style,
	// 					posInfo.id
	// 				);
	// 				// curBlock.setPos(posInfo.startX, posInfo.startY);
	// 				this.curBoardStep--;
	// 			} while (step < this.curBoardStep);
	// 			break;
	// 		case step > this.curBoardStep: //move next
	// 			do {
	// 				this.curBoardStep++;
	// 				var posInfo = this.stepInfo2PosInfo(this.curBoardStep);
	// 				// var curBlock = blockObj[posInfo.id];
	// 				// var style = curBlock.getAttr('style');

	// 				// setBoardState(boardState, posInfo.startX, posInfo.startY, curBlock.getAttr('style'), 0);
	// 				this.setBoardState(
	// 					this.boardState,
	// 					posInfo.endX,
	// 					posInfo.endY,
	// 					curBlock.getAttr('style'),
	// 					posInfo.id
	// 				);
	// 				// curBlock.setPos(posInfo.endX, posInfo.endY);
	// 			} while (step > this.curBoardStep);
	// 			break;
	// 	}
	// }

	//---------------------------------------------
	// convert board state to board string format
	// for solver to solve it
	//---------------------------------------------
	// private boardState2BoardString(boardState: number[][]) {
	// 	//0    1    2    3    4
	// 	let blockValue = ['@', 'N', 'B', 'H', 'A'];
	// 	let boardString = [];
	// 	let tmpBoardState = [];
	// 	let id = 0;

	// 	//copy 2 dimensional array
	// 	for (let x = 0; x < G_BOARD_X; x++) {
	// 		tmpBoardState[x] = boardState[x].slice(0);
	// 	}

	// 	for (let y = 0; y < G_BOARD_Y; y++) {
	// 		for (let x = 0; x < G_BOARD_X; x++) {
	// 			if ((id = tmpBoardState[x][y]) >= 0) {
	// 				if (id == 0) {
	// 					//empty block
	// 					boardString[x + y * G_BOARD_X] = blockValue[0];
	// 				} else {
	// 					let style = blockObj[id].getAttr('style');
	// 					let sizeX = blockObj[id].getAttr('sizeX');
	// 					let sizeY = blockObj[id].getAttr('sizeY');

	// 					for (let yy = 0; yy < sizeY; yy++) {
	// 						for (let xx = 0; xx < sizeX; xx++) {
	// 							tmpBoardState[x + xx][y + yy] = -1;
	// 							boardString[x + xx + (y + yy) * G_BOARD_X] = blockValue[style];
	// 						}
	// 					}
	// 					blockValue[style] = String.fromCharCode(
	// 						blockValue[style].charCodeAt(0) + 1
	// 					); //ascii + 1
	// 				}
	// 			}
	// 		}
	// 	}

	// 	return boardString.join('');
	// }

	//-------------------------------------
	// from source board to target board
	// to get the move info
	//-------------------------------------
	private getMoveInfo(srcBoard: any, dstBoard: any) {
		let srcPos = null;
		let dstPos = null;
		let srcStyle = null;
		let dstStyle = null;

		for (
			let i = 0;
			i < srcBoard.length && (dstPos == null || srcPos == null);
			i++
		) {
			if (srcBoard[i] != dstBoard[i]) {
				if (srcBoard[i] == '@') {
					//move block to here
					if (dstPos == null) {
						//first time
						dstPos = i;
						dstStyle = dstBoard[i];
					}
				} else if (dstBoard[i] == '@') {
					// move block out here
					/*
				if(dstBoard[i] != ' ') {
					debug("Error2: wrong board (" + i + ") !");
					break;
				}*/
					if (srcPos == null) {
						//first time
						srcPos = i;
						srcStyle = srcBoard[i];
					}
				}
			}
		}
		let srcX = srcPos! % G_BOARD_X,
			srcY = (srcPos! - srcX) / G_BOARD_X;
		let dstX = dstPos! % G_BOARD_X,
			dstY = (dstPos! - dstX) / G_BOARD_X;

		//find the left-up position
		while (srcX > 0 && srcBoard[srcX - 1 + srcY * G_BOARD_X] === srcStyle)
			srcX--;
		while (srcY > 0 && srcBoard[srcX + (srcY - 1) * G_BOARD_X] === srcStyle)
			srcY--;

		//find the left-up position
		while (dstX > 0 && dstBoard[dstX - 1 + dstY * G_BOARD_X] === dstStyle)
			dstX--;
		while (dstY > 0 && dstBoard[dstX + (dstY - 1) * G_BOARD_X] === dstStyle)
			dstY--;

		return { startX: srcX, startY: srcY, endX: dstX, endY: dstY };
	}

	//-------------------------------------------------
	// convert integer board key to board value
	// with different char value of same block style
	// for draw board
	//-------------------------------------------------
	private key2Board(curKey: number) {
		let blockIndex;
		let board = [];
		//0   1    2    3    4
		let blockValue = ['@', 'N', 'B', 'H', 'A'];
		let primeBlockPos = curKey & 0x0f; //position of prime minister block (曹操), 4 bits

		//set prime minister block
		board[primeBlockPos] = blockValue[4];
		board[primeBlockPos + G_BOARD_X] = blockValue[4];
		board[primeBlockPos + 1] = blockValue[4];
		board[primeBlockPos + 1 + G_BOARD_X] = blockValue[4];
		curKey = Math.floor(curKey / 16); //shift >> 4 bits

		for (let curPos = G_BOARD_Y * G_BOARD_X - 1; curPos >= 0; curPos--) {
			if (board[curPos] == blockValue[4]) continue;

			blockIndex = curKey & 0x03; //2 bits
			curKey >>= 2; //shift >> 2 bits, now the value <= 32 bits can use bitwise operator

			if (typeof board[curPos] != 'undefined') continue;

			switch (blockIndex) {
				case 0: //empty block
					board[curPos] = blockValue[0];
					break;
				case 1: // 1X1 block
					board[curPos] = blockValue[1];
					blockValue[1] = String.fromCharCode(blockValue[1].charCodeAt(0) + 1); //ascii + 1
					break;
				case 2: // 2X1 block
					board[curPos] = blockValue[2];
					board[curPos - 1] = blockValue[2];
					blockValue[2] = String.fromCharCode(blockValue[2].charCodeAt(0) + 1); //ascii + 1
					break;
				case 3: // 1X2 block
					board[curPos] = blockValue[3];
					board[curPos - G_BOARD_X] = blockValue[3];
					blockValue[3] = String.fromCharCode(blockValue[3].charCodeAt(0) + 1); //ascii + 1
					break;
				case 4: // 2X2 block
				default:
					console.error('key2Board(): design error !');
					break;
			}
		}
		return board;
	}

	//----------------------------------------
	// return maxMove < 0 : no solution
	//                = 0 : don't need move
	//                > 0 : OK
	//        time: elapsed-time
	//----------------------------------------
	// private setAutoMoveStepInfo() {
	// 	let boardString = boardState2BoardString(this.boardState);

	// 	findAnswer.init(boardString);
	// 	let result = findAnswer.find();
	// 	let maxMove = -1;

	// 	debug('find answer, elapsed-time: ' + result.elapsedTime);
	// 	if (result.boardList != null) {
	// 		maxMove = result.boardList.length - 1;
	// 	}

	// 	if (maxMove > 0) {
	// 		let tmpBoardState = [];

	// 		stepInfo = [];
	// 		curBoardStep = 0;
	// 		//copy 2 dimensional array
	// 		for (let x = 0; x < G_BOARD_X; x++) {
	// 			tmpBoardState[x] = boardState[x].slice(0);
	// 		}

	// 		for (let i = 1; i <= maxMove; i++) {
	// 			let moveInfo = getMoveInfo(
	// 				key2Board(result.boardList[i - 1]),
	// 				key2Board(result.boardList[i])
	// 			);
	// 			let blockId = tmpBoardState[moveInfo.startX][moveInfo.startY];
	// 			let step = setStepInfo(
	// 				blockId,
	// 				moveInfo.startX,
	// 				moveInfo.startY,
	// 				moveInfo.endX,
	// 				moveInfo.endY,
	// 				1,
	// 				i == 1 ? 0 : 1
	// 			);

	// 			//change temp board state
	// 			let style = blockObj[blockId].getAttr('style');
	// 			setBoardState(
	// 				tmpBoardState,
	// 				moveInfo.startX,
	// 				moveInfo.startY,
	// 				style,
	// 				0
	// 			);
	// 			setBoardState(
	// 				tmpBoardState,
	// 				moveInfo.endX,
	// 				moveInfo.endY,
	// 				style,
	// 				blockId
	// 			);
	// 		}
	// 	}

	// 	return { maxMove: maxMove, time: result.elapsedTime };
	// }
}
