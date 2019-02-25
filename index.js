const fs = require('fs');
const path = require('path');



const argument = process.argv;



dir = argument[2];

//leer un archivo
fs.readFile(dir, function(err,data){
	if(err){
		console.log(err)
	}
	console.log(data.toString());
});
 


