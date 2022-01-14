import * as path from 'path';
import * as webpack from 'webpack';
// in case you run into any typescript error when configuring `devServer`
import 'webpack-dev-server';

const config: webpack.Configuration = {
	entry: './src/Hrd.ts',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_module/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js', '.spec.ts'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'hrd.bundle.js',
		library: {
			name: 'hrdLib',
			type: 'umd',
		},
	},
};

export default config;
