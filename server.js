/* NODEJS APP Server */

// Variable Declarations
const
    fs = require('fs'),
    url = require('url'),
    date = new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '_'),
    conf = require('./conf.json'),
    http = require('http'),
    path = require('path'),
    https = require('https'),
    logDir = path.join(__dirname, 'logs'),
    logFile = path.join(logDir, 'log-' + date),//.replace(/:/g,'-').replace('.','_'),
    publicDir = path.join(__dirname, 'public'),
    varArr = fs.readFileSync(path.join(__dirname, '.env')).toString().split('/n'),
    errorPage = fs.readFileSync(path.join(publicDir, 'error.html'), 'utf8'),
    port = 3000,

// Fucntion expression declaration

!fs.existsSync(logDir) && fs.mkdirSync(logDir);
fs.writeFileSync(logFile, 'LOG STARTED ' + new Date() + '\n\n', 'utf8')
for (let v = 0; v < varArr.length; v++) { process.env[varArr[v].split('=')[0]] = varArr[v].split('=')[1] }
// }

function requestLogger({ protocol, host, path, query }) {
    return fs.appendFileSync(
        logFile,
        `${new Date().toLocaleString()} ->PROTOCOL:${protocol},HOST:${host}, PATH:${path}, QUERY: ${query}\n`,
        'utf8'
    );
}

function errorLogger(err) { return fs.appendFileSync(logFile, `${new Date().toLocaleString()} ERROR: ${new Error(err)}`, 'utf8'); }

function deleteLogFiles() {
    try {
        const logFiles = fs.readdirSync(logDir);
        if (logFiles.length === 0) return; // early exit
        for (let l = 0; l < logFiles.length; l++) fs.unlinkSync(path.join(logDir, logFiles[l]))
    } catch (err) {
        throw new Error(err);
    }
}

http.createServer((request, response) => {

    requestLogger(url.parse(`http://${request.headers.host}${request.url}`));

    fs.readFile(
        path.join(publicDir, request.url === '/' ? 'index.html' : request.url),
        function (err, fileBuffer) {

            if(err){
                errorLogger(err);
                response.statusCode = 500;
                errorPage
                    .replace('{{ERROR-CODE}}','500')
                    .replace('{{ERROR-MESSAGE}}',err)
                response.end(errorPage);
            }

            // response.setHeader("Content-Type","text/html");
            response.statusCode = 200;
            response.write(fileBuffer);
            response.end();
        })

}).listen(port);


