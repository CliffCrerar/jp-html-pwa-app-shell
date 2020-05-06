/* NODEJS APP Server */

// Variable Declarations
const
    date = new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '_'),
    conf = require('./conf.json'),
    http = require('http'),
    https = require('https'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    logDir = path.join(__dirname, 'logs'),
    logFile = path.join(logDir, 'log-' + date),//.replace(/:/g,'-').replace('.','_'),
    publicDir = path.join(__dirname, 'public'),
    indexFile = fs.readFileSync(path.join(publicDir, 'index.html')),
    errorPage = fs.readFileSync(path.join(publicDir, 'error.html')),
    msg = {
        InitNotComplete: 'Incomplete Initialization, Cannot Start Server'
    };
// Fucntion expression declaration

const
    createLogsDirectory = () => !fs.existsSync(logDir) && fs.mkdirSync(logDir),
    createLog = () => {
        try {
            createLogsDirectory();
            fs.writeFileSync(logFile, 'LOG STARTED ' + new Date() + '\n\n', 'utf8')
        } catch (err) {
            console.error(err);
        }
    };

// function statement declarations
console.log('logFile: ', logFile);

function environmentVariables() {
    try {
        const varArr = fs.readFileSync(path.join(__dirname, '.env')).toString().split('/n');
        for (let v = 0; v < varArr.length; v++) process.env[varArr[v].split('=')[0]] = varArr[v].split('=')[1];
    } catch (err) {
        throw new Error(err)
    }
}


function requestLogger({ protocol, host, path, query }) {
    try {
        const msg = `${new Date().toLocaleString()} ->PROTOCOL:${protocol},HOST:${host}, PATH:${path}, QUERY: ${query}\n`;
        return fs.appendFileSync(logFile, msg, 'utf8');
    } catch (err) {
        throw new Error(err);
    }
}

function errorLogger(err) {
    const thisError = new Error(err);
    const msg = `${new Date().toLocaleString()} ERROR: ${thisError}`;
    return fs.appendFileSync(logFile, msg, 'utf8');
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


function getMime(callback) {

    const req = https.request(conf.mimes, res => {
        let payload = '';
        res.on('data', data => payload += data);
        res.on('end', () => callback(payload))
    })
    req.on('error', err => {
        callback(err);
        req.end;
    })
    req.end()
}

function Initialize() {
    return new Promise((resolve, reject) => {
        try {
            environmentVariables();
            // createLogsDirectory();
            // deleteLogFiles();
            createLog();
            getMime(mimes => {
                return resolve(mimes);
            })
        } catch (err) {
            return reject(err);
        }
    })
}

// Main execution block

Initialize().then((mimes) => {
    console.log('mimes: ', mimes)

    http.createServer(function (request, response) {
        let file = '';
        try {
            const urlObject = url.parse('http://' + request.headers.host + request.url)
            const fileRequestPath = path.join(publicDir, urlObject.path === '/' ? 'index.html' : urlObject.path);
            const fileRequestPathDetials = path.parse(fileRequestPath);
            file = fs.readFileSync(fileRequestPath);
            console.log('path', urlObject.path);
            console.log('urlObject: ', urlObject);
            console.log('fileRequestPath: ', fileRequestPath);
            console.log('fileRequestPathDetials: ', fileRequestPathDetials);

            requestLogger(urlObject);
            let Mime = 'text/html'
            // serveFile(urlObject.path,function(isPublicFile, File, Mime){
            // if(isPublicFile){
            response.writeHead(200, "OK", Mime);

        } catch (err) {
            file = errorPage;
            errorLogger(err);
            console.log('err: ', err);
            console.log('err: ', err.code);
            const thisError = new Error(err);

            console.log('thisError: ', thisError);

            switch (err.code) {
                case 'ENOENT': response.writeHead(404, thisError.message, 'text/html'); break;
                default: response.writeHead(500, thisError.message, 'text/html');
            }
        }
        response.end(file);

    }).listen(8080)

}).catch(err => {
    console.error(err);
    throw new Error(msg.InitNotComplete)
}).catch(err => {
    console.error(err);
    throw new Error(msg.InitNotComplete)
})






