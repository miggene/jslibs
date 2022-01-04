import { MOVE_MODE } from './configs/HrdConfigs';
import { convertBoardStr2BoardCharIndexArr, verifyBoard } from './HrdHelper';
import { BoardObj } from './interface/IHrd';

export class Hrd {
	private _moveMode: MOVE_MODE = MOVE_MODE.RIGHT_ANGLE_TURN;
	private _initBoard: number[]; //charIndexArr

	public init(boardStr: string, boardMoveMode?: MOVE_MODE) {
		try {
			verifyBoard(boardStr);
		} catch (error) {
			console.error(error);
		}
		boardMoveMode && (this._moveMode = boardMoveMode);
		this._initBoard = convertBoardStr2BoardCharIndexArr(boardStr);
	}

	//------------------------------------------------------------
	//add new state to queue and hashmap if does not exist before
	//------------------------------------------------------------
	public statePropose(boardObj: BoardObj, parentKey: number) {}
}
