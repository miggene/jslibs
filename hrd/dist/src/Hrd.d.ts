import { MOVE_MODE } from './configs/HrdConfigs';
import { BoardObj } from './interface/IHrd';
export default class Hrd {
    private _moveMode;
    private _initBoard;
    private _queue;
    private _hashTable;
    init(boardStr: string, boardMoveMode?: MOVE_MODE): void;
    statePropose(boardObj: BoardObj, parentKey: number): number;
    reachGoal(boardCharIndexArr: number[]): boolean;
    find(): {
        exploreCount: number;
        elapsedTime: number;
        boardList: number[];
    };
    getAnswerList(curKey: number, board: number[]): void;
    explore(boardObj: BoardObj): number;
    /**
     *
     * @param boardObj
     * @param parentKey
     * @param emptyBlockR
     * @param emptyBlockC
     * @param direction emptyblock的移动方向，1下，-1上
     * @param maxMove
     */
    slideVertical(boardObj: BoardObj, parentKey: number, emptyBlockR: number, emptyBlockC: number, direction: number, maxMove: number): number;
    slideHorizontal(boardObj: BoardObj, parentKey: number, emptyBlockR: number, emptyBlockC: number, direction: number, maxMove: number): number;
    countLengthC(board: number[], row: number, col: number, directionC: -1 | 1, blockCharIndex: number): number;
    countLengthR(board: number[], row: number, col: number, directionR: -1 | 1, blockCharIndex: number): number;
    printBoard(boardCharIndexArr: number[], key: number): void;
}
