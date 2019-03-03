const [, , ...args] = process.argv
const [filePath, ...opts] = args;

const options = {	validate: false,
	stats: false
}
const mdlinks = require('./index.js')


let flagOptions = 1

const msmError = () => {
	console.log('Error en el ingreso, se sugiere utilizar --validate /  --stats /  --validate --stats /  --validate --stats')
	flagOptions = 2
}

if (opts.length === 1) {
	if (opts[0] === '--stats') {
		options.stats = true
	}
	else if (opts[0] === '--validate') {
		options.validate = true
	}
	else {
		msmError()
	}
}
else if (opts.length === 2) {
	if (opts[0] === '--validate' && opts[1] === '--stats' || opts[0] === '--stats' && opts[1] === '--validate') {
		options.stats = true
		options.validate = true
	}
	else {
		msmError()
	}
}
else if (opts.length > 2) {
	msmError()

}
opts.indexOf('--validate') !== -1 ? options.validate = true : options.validate = false
opts.indexOf('--stats') !== -1 ? options.stats = true : options.stats = false

if (flagOptions === 1) {
	mdlinks(filePath, options).then(result => {

		if (options.validate && options.stats) {
			console.log(` Total: ${result.total} \n Unique: ${result.unique} \n Broken: ${result.broken}`)
		}
		else if (options.validate) {
			result.forEach(element => {
				console.log(`${element.file}  ${element.href}\t${element.text}\t${element.statusCode}\t${element.statusMessage}`)
			});
		}
		else if (options.stats) {
			console.log(` Total: ${result.total} \n Unique: ${result.unique}`)
		}
		else {
			result.forEach(element => {
				console.log(`${element.file}\t${element.href}`)
			});
		}
	}).catch(err => {
		console.log('Error en el ingreso');
	})
}





