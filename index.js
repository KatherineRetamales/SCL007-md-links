const fs = require('fs');
const path = require('path');
//path.resolve()método dará salida a la ruta absoluta
const pathResolve = require('path').resolve;


const argument = process.argv;
const dir = argument[2];


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
						fileDataObj.nameFile= file,
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


getFilesArray(dir).then(getFilesMd).then(readFile).then(result => {
	console.log(result);
}).catch(() => {
	console.log('error');
});






