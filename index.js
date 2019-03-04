#! / usr / bin / env nodo
const fs = require('fs');
const path = require('path');
const pathResolve = require('path').resolve;
const https = require('https');
const http = require('http');
const argument = process.argv;
const dir = pathResolve(argument[2]);
const options = argument.splice(3, 3);

const getFilesArray = (dir) => {
	const filesArray = [];
	return new Promise((resolve, reject) => {
		if (fs.lstatSync(dir).isFile()) {
			filesArray.push(dir);
			resolve(filesArray);
		} else if (fs.lstatSync(dir).isDirectory()) {
			const getFiles = (dir) => {
				fs.readdirSync(dir).map(file => {
					let files = path.join(dir, file);
					fs.lstatSync(files).isDirectory() ? getFiles(files) : filesArray.push(files);
				});
			}
			getFiles(dir);
			resolve(filesArray);
		}
	});
}

//filtrar solamente los archivos md
const getFilesMd = (filesArray) => {
	return new Promise((resolve, reject) => {
		let fileMd = filesArray.filter(file => path.extname(file) === '.md');
		resolve(fileMd);
	});
}


// leer uno o mas archivo de la ruta 
const readFile = (fileMd) => {
	return new Promise((resolve, reject) => {
		const fileArray = fileMd.map(file => {
			return new Promise((resolve, reject) => {
				fs.readFile(file, 'utf8', (err, data) => {
					if (err) {
						reject(err);
					} else {
						const fileDataObj = {};
						fileDataObj.nameFile = file,
							fileDataObj.dataFile = data
						resolve(fileDataObj);
					}
				})
			})
		})
		Promise.all(fileArray).then(file => {
			let fileDataArray = []
			file.forEach(fileDataObj => {
				fileDataArray.push(fileDataObj)
			})
			resolve(fileDataArray);
		})
	})
}


//buscar url de la ruta 
const findUrl = (fileDataArray) => {
	return new Promise((resolve, reject) => {
		const expReg = /([[].*]).https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const arrayData = fileDataArray.map(file => {
			return new Promise((resolve, reject) => {
				const urlArray = file.dataFile.match(expReg);
				const arrayObj = [];
				for (url in urlArray) {
					const splitData = urlArray[url].split('](');
					arrayObj.push({
						href: splitData[1],
						text: splitData[0],
						file: file.nameFile,
						statusMessage: null,
						statusCode: null
					});
				}
				resolve(arrayObj);
			});
		});
		Promise.all(arrayData).then(file => {
			const arrayObj = [];
			file.forEach(elem => {
				elem.forEach(objElem => {
					arrayObj.push(objElem);
				});
			});
			resolve(arrayObj);
		});
	});
}

//validar link 
const valideteUrl = (arrObj) => {
	return new Promise((resolve, reject) => {
		const arrPromises = arrObj.map(objElm => {
			return new Promise((resolve, reject) => {
				if (objElm.href.substr(0, 5) === 'https') {
					https.get(objElm.href, res => {
						objElm.statusMessage = res.statusMessage;
						objElm.statusCode = res.statusCode;
						resolve(objElm);
					}).on('error', e => {
						objElm.statusMessage = e;
						objElm.statusCode = e;
						resolve(objElm);
					});
				} else {
					http.get(objElm.href, res => {
						objElm.statusMessage = res.statusMessage;
						objElm.statusCode = res.statusCode;
						resolve(objElm);
					}).on('error', e => {
						objElm.statusMessage = e;
						objElm.statusCode = e;
						resolve(objElm);
					});
				}
			});
		});
		Promise.all(arrPromises).then(promiseUrls => {
			resolve(promiseUrls);
		});
	});
}



getFilesArray(dir).then(getFilesMd).then(readFile).then(findUrl).then(valideteUrl).then(result => {
	//total de url
	const total = result.length;
	const filterbroken = result.filter(url => url.statusCode !== 200);
	//total roto
	const broken = filterbroken.length;
	const uniqueObj = {};
	result.forEach(url => {
		if (!uniqueObj.hasOwnProperty(url.href)) {
			uniqueObj[url.href] = 0;
		} else {
			uniqueObj[url.href] = uniqueObj + 1;
		}
	});
	const filterunique = Object.keys(uniqueObj).filter(url => uniqueObj[url] === 0);
	//total unico
	const unique = filterunique.length;
	const resultObj = {};
	if (options[0] === '--validate' && options[1] === '--stats') {
		resultObj.total = total,
			resultObj.unique = unique,
			resultObj.broken = broken
		console.log(resultObj);
	} else if (options[0] === '--validate') {
		console.log(result);
	} else if (options[0] === '--stats'){
		resultObj.total = total,
			resultObj.unique = unique
		console.log(resultObj);
	}else if(options[0]!== '--validate' || options[0] !== '--stats'){
		console.log('Debe escribir --validate o --stats o --validate --stats');
		
	}else if(options[0]!== '--validate' && options[1] !== '--stats'){
		console.log('Debe escribir --validate --stats o --stats --validate');
		
	}else{
		const resultArray = result.map(url => {
			const obj = {}
			obj.href = url.href
			obj.file = url.file
			obj.text = url.text
			return obj
		});
		console.log(resultArray);
		
	}
}).catch(() => {
	console.log('error');
});













