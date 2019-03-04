const argument = process.argv;
const dir = argument[2];
const options = argument.splice(3, 3);


const mdlinks = require('./index.js');


mdlinks(dir).then(result => {
	result.forEach(element => {
		console.log(`${element.file}\t${element.href}`)
	});

}).catch(err => {
	console.log('Error en el ingreso');
});





