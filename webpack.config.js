'use strict';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

require('es6-promise').polyfill();

module.exports = {
	entry: ['./public/javascripts/main.ts', './public/stylesheets/style.scss'],

	output: {
		path: __dirname,
		filename: './public/javascripts/app.bundle.js'
	},

	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true
						}
					}
				]
			},
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
		// Colored output
		colors: true
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'public/stylesheets/style.css',
		})
	],
	// Create Sourcemaps for the bundle
	devtool: 'source-map'
};