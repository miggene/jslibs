//=======================================
// Klotski share variable & function
//=======================================

//---------------------------------------------------------------------------------------
//  0----------> X
//  |"HAAI"
//  |"HAAI"
//  |"JBBK"
//  |"JNOK"
//  |"P@@Q"
//  V
//  Y
//
// normal block = A..[
// empty  block = @
//---------------------------------------------------------------------------------------
//Block Shapes:
//    @, AA BB CC DD EE FF GG  H  I  J  K  L  M  N  O  P  Q  R  S  T  U  V  W  X  Y  Z  [
//       AA                    H  I  J  K  L  M
//---------------------------------------------------------------------------------------
export const BOARD_SIZE = [5, 4]; //[行、列]
export const VOID_CHAR = '?';
export const EMPTY_CHAR = '@';
export const EMPTY_BLOCK_CHAR_INDEX = 1;
export const GOAL_BLOCK_INDEX = 2;
export const GOAL_TYPE_INDEX = 4;

//convert char to index of block style
//ASCII char   :       ?, @,  A,  B,C,D,E,F,G,  H,I,J,K,L,M,  N,O,P,Q,R,S,T,U,V,W,X,Y,Z,[
export const BLOCK_INDEX_LIST = [
	-1, 0, 4, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
	1, 1, 1,
];
// 滑块类型[空、1*1，1*2，2*1，2*2] [行、列]
export const BLOCK_TYPE_LIST = [
	[1, 1],
	[1, 1],
	[1, 2],
	[2, 1],
	[2, 2],
];
//出口坐标
export const GOAL_POS = [
	[4, 1],
	[4, 2],
];

export const EMPTY_BLOCK_COUNT = 2;

//划动移动模式
export const enum MOVE_MODE {
	RIGHT_ANGLE_TURN = 1,
	STRAIGHT = 2,
	ONE_CELL_ONLY = 3,
}

// 是否镜像
export const MIRROR_STATUS = true;
