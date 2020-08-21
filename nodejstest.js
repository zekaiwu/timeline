var http = require('http');
var short = require('short-uuid');
var translator = short();
var fs = require('fs');
var path = require('path');
let result;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { parse } = require('querystring');

http.createServer(function (request, response) {
    if (request.method == 'POST') {
        let body = [];
        request.on('error', (err) => {
            console.error(err);                                                                                                                                                                                                                                                                         
        }).on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            //get information
            body = Buffer.concat(body).toString();
            lines = body.split(/\r\n|\r|\n/);
            let f = lines[3];
            if (f == "WRITE")
                write(lines[7]);
            if (f == "READ")
                read(lines);
            if (f == "BOX") {
                var text = fs.readFileSync('ingredient.json', 'utf8');
                let ingredients = JSON.parse(text);
                result = {
                    name: 'box',
                    box: ingredients.box
                };
            };
        });
        response.end(JSON.stringify(result));
    }

    console.log('request ', request.url)

    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }
    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    var contentType = mimeTypes[extname] || 'application/octet-stream';
    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile('./404.html', function (error, content) {
                    response.writeHead(404, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
function write(s) {
    let output = JSON.parse(s);
    console.log(output.name);
    delete output.filename;
    let filename = output.id+'_v'+output.version+'_'+translator.fromUUID(output.uuid)+'.json';
    console.log(filename);
    fs.writeFile(filename, JSON.stringify(output, null, "\t"), function (err) {
        if (err) throw err;
        console.log('saved!');
    });
}
