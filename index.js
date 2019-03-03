const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
//const pathResolve = require('path').resolve;
//const Promise = require('bluebird');


let arryObjUrl = []
const urlStatusOk = [];
const urlStatusNotFound = [];

const validateHttp = (arrObj) => {
	return new Promise((resolve, reject) => {
		const arrPromises = arrObj.map(objElm => {
			return new Promise((resolve, reject) => {

				const urlDomainExists = (response) => {
					objElm.statusMessage = response.statusMessage
					objElm.statusCode = response.statusCode
					resolve(objElm);

				}
				const urlDomainDoesNotExist = () => {
					objElm.statusMessage = 'Domain does not exist'
					objElm.statusCode = 'Domain does not exist'
					resolve(objElm)
				}
				if (objElm.href.substr(0, 5) === 'https') {
					https.get(objElm.href, response => { urlDomainExists(response) })
						.on('error', e => { urlDomainDoesNotExist() })
				} else {
					http.get(objElm.href, response => { urlDomainExists(response) })
						.on('error', e => { urlDomainDoesNotExist() })
				}
			})
		})
		Promise.all(arrPromises).then(promiseUrls => {
			resolve(promiseUrls)
		})

	})
}

const findUrlText = (arrObjPathData) => {
	return new Promise((resolve, reject) => {
		const regExp = /([[].*]).https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const arrObj = arrObjPathData.filter(elem => elem.data !== '')
		const arrPromises = arrObj.map(objElm => {
			return new Promise((resolve, reject) => {
				const arrUrl = objElm.data.match(regExp)
				const arr = []
				arrUrl.forEach(hrefElement => {
					const splitElm = hrefElement.split('](')
					arr.push({
						href: splitElm[1],
						file: objElm.path.replace("/", "\\\\"),
						text: splitElm[0].slice(1),
						statusMessage: null,
						statusCode: null
					})
				})
				resolve(arr)
			})
		})
		Promise.all(arrPromises).then(arrElement => {
			const arrObjHref = []
			arrElement.forEach(elem => {
				elem.forEach(objElem => {
					arrObjHref.push(objElem)
				})
			})
			resolve(arrObjHref)
		})
	})
}
const getFilesList = (dir) => {
	const arrFiles = []
	return new Promise((resolve, reject) => {
		if (fs.lstatSync(dir).isFile()) {
			arrFiles.push(dir)
			resolve(arrFiles)
		}
		else if (fs.lstatSync(dir).isDirectory()) {
			const getFiles = (dir) => {
				const files = fs.readdirSync(dir);

				for (let file in files) {
					let next = path.join(dir, files[file]);
					fs.lstatSync(next).isDirectory() ? getFiles(next) : arrFiles.push(next)
				}
			}
			getFiles(dir)
			resolve(arrFiles);
		}
		else {
			reject(Error('no es un archivo'))
		}
	})
}

const validateFileMd = (arrFiles) => {
	return new Promise((resolve, reject) => {
		const filesMd = arrFiles.filter(elem => {
			return path.extname(elem) == '.md'
		})
		resolve(filesMd)
	})
}
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

const mdlinks = (path, options) => {
	return new Promise((resolve, reject) => {
		getFilesList(path).then(validateFileMd).then(readFileMd).then(findUrlText).then(validateHttp).then(result => {
			const total = result.length
			const broken = result.filter(elem => elem.statusCode !== 200).length
			const objUnique = {}
            const obj = {}
            
			result.forEach(elem => {
				if (!objUnique.hasOwnProperty(elem.href)) {
					objUnique[elem.href] = 0
                }
                else{
                    objUnique[elem.href] = objUnique[elem.href] + 1
                }
            })
            
			const unique = Object.keys(objUnique).filter((elem) => objUnique[elem] === 0).length

			if (options.validate && options.stats) {
				obj.total = total
				obj.unique = unique
				obj.broken = broken
				resolve(obj)
			}
			else if (options.validate) {
				resolve(result)
			}
			else if (options.stats) {
				obj.total = total
				obj.unique = unique
				resolve(obj)
			}
			else {
				const arrValidateStats = result.map(elem => {
					const newObj = {}
					newObj.href = elem.href
					newObj.file = elem.file
					newObj.text = elem.text
					return newObj
				})
				resolve(arrValidateStats)
			}
		})
	})
}

module.exports = mdlinks;


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
/*const getFilesArray= (dir) => {
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

const findUrlText = (arrObjPathData) => {
	return new Promise((resolve, reject) => {
		const regExp = /([[].*]).https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const arrObj = arrObjPathData.filter(elem => elem.data !== '')
		const arrPromises = arrObj.map(objElm => {
			return new Promise((resolve, reject) => {
				const arrUrl = objElm.data.match(regExp)
				const arr = []
				arrUrl.forEach(hrefElement => {
					const splitElm = hrefElement.split('](')
					arr.push({
						href: splitElm[1],
						text: splitElm[0].slice(1),
						statusMessage: null,
						statusCode: null
					})
				})
				resolve(arr)
			})
		})
		Promise.all(arrPromises).then(arrElement => {
			const arrObjHref = []
			arrElement.forEach(elem => {
				elem.forEach(objElem => {
					arrObjHref.push(objElem)
				})
			})
			resolve(arrObjHref)
		})
	})
}
const validateHttp = (arrObj) => {
	return new Promise((resolve, reject) => {
		const arrPromises = arrObj.map(objElm => {
			return new Promise((resolve, reject) => {

				const urlDomainExists = (response) => {
					objElm.statusMessage = response.statusMessage
					objElm.statusCode = response.statusCode
					resolve(objElm);

				}
				const urlDomainDoesNotExist = () => {
					objElm.statusMessage = 'Domain does not exist'
					objElm.statusCode = 'Domain does not exist'
					resolve(objElm)
				}
				if (objElm.href.substr(0, 5) === 'https') {
					https.get(objElm.href, response => { urlDomainExists(response) })
						.on('error', e => { urlDomainDoesNotExist() })
				} else {
					http.get(objElm.href, response => { urlDomainExists(response) })
						.on('error', e => { urlDomainDoesNotExist() })
				}
			})
		})
		Promise.all(arrPromises).then(promiseUrls => {
			resolve(promiseUrls)
		})

	})
}*/
/*getFilesArray(dir).then(validateFileMd).then(readFileMd).then(findUrlText).then(validateHttp).then(result => {
	console.log(result);
}).catch(() => {
	console.log('error');
});*/






