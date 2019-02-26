const fs = require('fs');
const path = require('path');

const argument = process.argv;
const dir = argument[2];

//Obtener archivo y guardarlo en un array
const getFile = (dir) => {
	fileArray = [];
	return new Promise((resolve, reject) => {
		fileArray.push(dir);
		resolve(fileArray);
	});
}
// leer archivo utf8
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
		arrUrl.forEach(hrefElement => {
			const splitElm = hrefElement.split('](');
			arr.push({
				href: splitElm[1]
			});
		});
		resolve(arr);
	});
}


getFile(dir).then(readFile).then(findLinks).then(result => {
	console.log(result);
}).catch(() => {
	console.log('error');

});






