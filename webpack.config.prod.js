'use strict';

module.exports = {
	entry: './public/javascripts/main.ts',
	output: {
		path: __dirname,
		filename: './dist/public/javascripts/app.bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
				  	'babel-loader',
					{
						loader: 'ts-loader'
					}
				]
			}, 
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	stats: {
		colors: true
	},
	devtool: 'source-map'
};