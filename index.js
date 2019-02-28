const fs = require('fs');
const path = require('path');
//const pathResolve = require('resolve-path');
var pathResolve = require('path').resolve;
const Promise = require('bluebird');

const argument = process.argv;
const dir = argument[2];




//leer la ruta,si es una carpeta o archivo si es una archivo guardarlo en una array //
/*const readdirPromise = (dir) => {
	return new Promise((resolve, reject) => {
		fs.readdir(dir, (err, paths) => {
			err ? reject(err) : resolve(paths);
		});
	});
}

const readFilePromise = (path) => {
	return new Promise.resolve(path);
}
const isDirectory = (path) => {
	return fs.lstatSync(path).isDirectory();
}

const explore = (dir) => {
	return readdirPromise(dir)
		.then((paths) => {
			return Promise.all(paths.map((path) => {
				path = pathResolve(dir, path);
				return isDirectory(path) ? explore(path) : readFilePromise(path);
			}));
		}).catch((err) => {
			console.log(err);
			throw err;
		});
}

const printArray = (arr) => {
	return new Promise((resolve, reject) => {
		resolve(JSON.stringify(arr, null, 4));
	});
}*/
const getFilesArray= (dir) => {
	const arrayFiles = []
	return new Promise((resolve, reject) => {
		if (fs.lstatSync(dir).isFile()) {
			arrayFiles.push(dir);
			resolve(arrayFiles);
		}else if (fs.lstatSync(dir).isDirectory()) {
			const getFiles = (dir) => {
				const files = fs.readdirSync(dir);

				for (let file in files) {
					let next = pathResolve(path.join(dir, files[file]));
					fs.lstatSync(next).isDirectory() ? getFiles(next) : arrayFiles.push(next);
				}
			}
			getFiles(dir);
			resolve(arrayFiles);
		}
	});
}

//validar que el archivo sea md
const validateFileMd = (arr) => {
	return new Promise((resolve, reject) => {
		let fileMd = arr.filter(file => path.extname(file) === '.md');
		resolve(fileMd);
	});
}

// leer archivo 
// leer un archivo
const readFileMd = (filesExtendMd) => {
	return new Promise((resolve, reject) => {
		const arrPromisesUtf = filesExtendMd.map(element => {
			return new Promise((resolve, reject) => {
				fs.readFile(element, 'utf8', (err, data) => {
					if (err) {
						throw new Error('Failed ')
					} else {
						const objDataPath = {}
						objDataPath.path = element
						objDataPath.data = data
						resolve(objDataPath)
					}
				})
			})
		})
		Promise.all(arrPromisesUtf).then(promisesUft => {
			let totalData = []
			promisesUft.forEach(objDataPath => {
				totalData.push(objDataPath)
			})
			resolve(totalData)
		})
	})
}


//buscar link 
const findLinks = (fileArray) => {
	return new Promise((resolve, reject) => {
		const regExp = /([[].*]).https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const arrUrl = fileArray.data.match(regExp);

		const arr = [];
		return new Promise(() => {
			arrUrl.forEach(hrefElement => {
				const splitElm = hrefElement.split('](');
				arr.push({
					href: splitElm[1],
					text: splitElm[0],
					file: dir
				});
			});
			resolve(arr);
		});
	});
}

//validar link 
const valideteLink = (objLinks) => {
	return new Promise((resolve, reject) => {

	});
}


getFilesArray(dir).then(validateFileMd).then(readFileMd).then(findLinks).then(result => {
	console.log(result);
}).catch(() => {
	console.log('error');
});






