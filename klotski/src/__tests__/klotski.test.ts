import Klotski, { Move, Options, Block, Game, Step } from '../klotski';
import * as hrdGames from '../../data/hrd-games.json';

let klotski: Klotski;
beforeEach(() => {
	klotski = new Klotski();
});

test('should solve the problem', () => {
	const result = klotski.solve(hrdGames[0] as Options);
	expect(result![result!.length - 1].step).toBe(81);
	expect(result?.length).toBe(118);
});

test('should solve the problem with options', () => {
	const result = klotski.solve({
		blocks: hrdGames[0].blocks as Block[],
		useMirror: false,
		boardSize: [5, 4],
		escapePoint: [3, 1],
	});
	expect(result![result!.length - 1].step).toBe(81);
	expect(result?.length).toBe(118);
});

test('should solve the problem with options by add the useMirror=true', () => {
	const result = klotski.solve({
		blocks: hrdGames[0].blocks as Block[],
		useMirror: true,
	});
	expect(result![result!.length - 1].step).toBe(81);
	expect(result?.length).toBe(118);
});

test('should solve the problem with options by add the row and col', () => {
	const blocks = hrdGames[41].blocks as Block[];
	const result = klotski.solve({
		blocks,
	});
	expect(result?.length).toBe(118);
});

test('should not solve the game for the same position', () => {
	const result = klotski.solve({ blocks: hrdGames[40].blocks as Block[] });
	expect(result).toBeNull();
});

test('should not solve the game for no answer', () => {
	const result = klotski.solve({ blocks: hrdGames[33].blocks as Block[] });
	expect(result).toBeNull();
});

test('should not move', () => {
	const game = klotski.createGame(hrdGames[0].blocks as Block[]);
	const state = game?.states[0];
	state!.blocks[9].directions = [0, 1, 2, 3];
	expect(klotski.canBlockMove(state!, 9, 4)).toBeFalsy();
});

test('should not merge the step', () => {
	const result = klotski.solve(hrdGames[0] as Options);
	const steps = result!.map((v) => {
		return {
			blockIdx: v.blockIdx,
			dirIdx: v.dirIdx,
			count: v.step,
		} as Step;
	});
	expect(klotski.mergeSteps(steps)).not.toEqual(steps);
});
