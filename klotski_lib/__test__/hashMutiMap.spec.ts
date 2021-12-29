/*
 * @Author: zhupengfei
 * @Date: 2021-12-17 13:54:41
 * @LastEditTime: 2021-12-17 15:01:25
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /klotski_lib/__test__/hashMutiMap.spec.ts
 */
const tstl = require('tstl');
test('test', () => {
	const hmMap = new tstl.HashMultiMap();
	hmMap.emplace('a', 1);
	hmMap.emplace('a', 2);
	hmMap.insert();
	const s = hmMap.toJSON();
	console.log('s :>> ', s);

	expect(s).toMatch('a:1');
});
