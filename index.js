const fs = require('fs');
const path = require('path');

const argument = process.argv;
const dir = argument[2];



//leer la ruta, reconocer si es una carpeta o archivo si es una archivo guardarlo en una array //
const getFile = (dir) => {
	fileArray = [];
	return new Promise((resolve, reject) => {
		fileArray.push(dir);
		resolve(fileArray);
	});
}

//validar que el archivo sea md
const validateFileMd = (fileArray) => {
	return new Promise((resolve,reject) =>{
		let fileMd = fileArray.filter(file => path.extname(file) === '.md');
		resolve(fileMd);
	});
}

// leer archivo 
const readFile = (fileArray) => {
	return new Promise((resolve, reject) => {
		fileArray.map(element => {
			fs.readFile(element, 'utf8', (err, data) => {
				const objDataPath = {};
				objDataPath.path = element
				objDataPath.data = data
				resolve(objDataPath);
			});
		})
	});
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
	return new Promise ((resolve,reject)=>{

	});
}


getFile(dir).then(validateFileMd).then(result => {
	console.log(result);
}).catch(() => {
	console.log('error');
});






