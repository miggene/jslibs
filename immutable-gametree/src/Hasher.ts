/*
 * @Author: zhupengfei
 * @Date: 2021-12-02 16:18:57
 * @LastEditTime: 2021-12-03 16:06:39
 * @LastEditors: zhupengfei
 * @Description:
 * @FilePath: /immutable-gametree/src/hasher.ts
 */

export const hasher = function () {
	let result = 5381;
	return (str: string) => {
		for (let i = 0; i < str.length; ++i) {
			result = (result * 33) ^ str.charCodeAt(i);
		}
		return result;
	};
};
