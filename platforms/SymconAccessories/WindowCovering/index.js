require('fs')
	.readdirSync(__dirname + '/')
	.forEach(
		function(file) {
			if (file !== 'index.js') {
				var name = file.replace('.js', '');
				module.exports[name] = require('./' + file);
			}
		}
	);