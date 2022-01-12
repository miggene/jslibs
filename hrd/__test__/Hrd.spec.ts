import { Hrd } from '../src/Hrd';
import { data } from './data/hrd_answers_straight';

describe('Hrd', () => {
	// for (let i = 0; i < 100; ++i) {
	// 	const boardStr = data[i].board;
	// 	const hrd = new Hrd();
	// 	hrd.init(boardStr);
	// 	const { exploreCount, elapsedTime, boardList } = hrd.find();
	// 	expect(exploreCount).toBeGreaterThanOrEqual(0);
	// 	expect(elapsedTime).toBeGreaterThanOrEqual(0);
	// 	expect(boardList).toBeDefined();
	// 	expect(boardList).toHaveProperty('length');
	// 	expect(boardList.length).toBeGreaterThan(0);
	// }

	test('find', () => {
		for (let i = 0; i < data.length; ++i) {
			const boardStr = data[i].board;
			const hrd = new Hrd();
			hrd.init(boardStr);
			const { exploreCount, elapsedTime, boardList } = hrd.find();
			expect(exploreCount).toBeGreaterThanOrEqual(0);
			expect(elapsedTime).toBeGreaterThanOrEqual(0);
			expect(boardList).toBeDefined();
			expect(boardList).toHaveProperty('length');
			expect(boardList.length).toBeGreaterThan(0);
			console.log(
				'exploreCount, elapsedTime, boardList :>> ',
				exploreCount,
				elapsedTime,
				boardList
			);
		}
	});
});
