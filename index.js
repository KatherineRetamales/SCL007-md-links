const fs = require('fs');
const path = require('path');



const argument = process.argv



dir = argument[2];

console.log(fs.lstatSync(dir));


//console.log("Es una carpeta " + fs.lstatSync(dir).isDirectory());
 


