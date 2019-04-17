module.exports = {
	'env': {
		'browser': true,
		'es6': true,
		'node': true,
		jquery: true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly',
		'Materialize': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'space-before-function-paren': [
			'error',
			'always'
		],
		'space-before-blocks': [
			'error',
			'always',
		],
		'keyword-spacing': [
			'error',
			{ 'before': true, 'after': true }
		],
		"no-multiple-empty-lines": [
			'error',
			{ 'max': 1 }
		]
	}
};