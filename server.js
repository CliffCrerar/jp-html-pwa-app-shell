/* NODEJS APP Server */

// Variable Declarations
const
    http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    logDir = path.join(__dirname, 'logs'),
    logFile = path.join(logDir, 'log-' + new Date()),
    publicDir = path.join(__dirname, 'public'),
    indexFile = fs.readFileSync(path.join(publicDir, 'index.html')),
    msg = {
        InitNotComplete: 'Incomplete Initialization, Cannot Start Server',
    }
// Fucntion expression declaration
const
    createLogsDirectory = () => !fs.existsSync(logDir) && fs.mkdirSync(logDir),
    createLog = () => fs.writeFileSync(logFile, 'LOG STARTED ' + new Date() + '\n\n', 'utf8');

// function statement declarations

function environmentVariables() {
    try {
        const varArr = fs.readFileSync(path.join(__dirname, '.env')).toString().split('/n');
        for (let v = 0; v < varArr.length; v++) process.env[varArr[v].split('=')[0]] = varArr[v].split('=')[1];
    } catch (err) {
        throw new Error(err)
    }
}


function requestLogger( { protocol, host, path, query } ) {
    try {
        const msg = `${new Date()} ->PROTOCOL:${protocol},HOST:${host}, PATH:${path}, QUERY: ${query}\n`;
        return fs.appendFileSync(logFile, msg, 'utf8');
    } catch (err) {
        throw new Error(err);
    }
}

function extensionToMimeType(){

}

function deleteLogFiles() {
    try {
        const logFiles = fs.readdirSync(logDir);
        if (logFiles.length === 0) return; // early exit
        for (let l = 0; l < logFiles.length; l++) fs.unlinkSync(path.join(logDir, logFiles[l]))
    } catch (err) {
        throw new Error(err);
    }
}


function getMime(ext, callback){

    s

}


function serveFile(publicFile,callback){
    const
        fileToGet = path.join(publicDir, publicFile === ('/' || '') ? 'index.html' : publicFile);
        fs.existsSync(fileToGet) 
            ? callback(true,fs.readFileSync(fileToGet), 'text/html')
            : callback(false, null, null);
}

function Initialize() {
    return new Promise((resolve, reject) => {
        try {
            environmentVariables();
            createLogsDirectory();
            // deleteLogFiles();
            createLog();
            return resolve();
        } catch (err) {
            return reject(err);
        }
    })
}

// Main execution block

Initialize().then(() =>

    http.createServer(function (request, response) {
        const urlObject = url.parse('http://' + req.headers.host + req.url)

        try {

            requestLogger(urlObject);
            response.writeHead(200, "OK", "text/html");
            serveFile(urlObject.path)

        } catch (err) {
            response.writeHead(500, 'Internal Server Error', 'application/json');
            response.end(err);
        }

    }).listen(8080)

).catch(err => {
    console.error(err);
    throw new Error(msg.InitNotComplete)
})






