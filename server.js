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
    indexFile = fs.readFileSync(path.join(publicDir, 'index.html'),'utf8'),
    errorPage = fs.readFileSync(path.join(publicDir, 'error.html'),'utf8'),
    msg = {
        InitNotComplete: 'Incomplete Initialization, Cannot Start Server'
    };
    mimeTypesObj = {};

// Fucntion expression declaration

function createLog() {
    !fs.existsSync(logDir) && fs.mkdirSync(logDir);
    fs.writeFileSync(logFile, 'LOG STARTED ' + new Date() + '\n\n', 'utf8')
};

// function statement declarations

function environmentVariables() { for (let v = 0; v < varArr.length; v++) process.env[varArr[v].split('=')[0]] = varArr[v].split('=')[1]; return; }

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


function getMime(callback) {
    const req = https.request(conf.mimes, res => {
        let payload = '';
        res.on('data', data => payload += data);
        res.on('end', () => callback(payload))
    })
    req.on('error', err => callback(err))
    req.end()
}

function getFile(options) {
    const filePath = path.join(publicDir, options.path);
    
    switch (options.path) {
        case '/': return {
            file: indexFile,
            mime: extractMime(filePath)
        };
        default: return {
            file:fs.readFileSync(filePath,'utf8'),
            mime: extractMime(filePath)
        };
    }

    function extractMime(fp){
        return Object.entries(JSON.parse(mimeTypesObj)).filter(sharr => sharr[0] === path.parse(fp).ext)[0][1]
    }
}

function Initialize() {
    return new Promise((resolve, reject) => {
        try {
            environmentVariables();
            // deleteLogFiles();
            createLog();
            getMime(mimes => {
                return resolve(mimes.toString());
            })
        } catch (err) {
            return reject(err);
        }
    })
}

// Main execution block

Initialize().then((mimes) => http.createServer(function (request, response) {
    // console.log('mimes: ', mimes);

    let fileSpace = '';

    mimeTypesObj = mimes;

    const requestUrl = 'http://' + request.headers.host + request.url;

    try {

        const urlObject = url.parse(requestUrl);

        const pathDetails = path.parse(requestUrl);
        
        const {file,mime} = getFile(urlObject);
        console.log('mime: ', mime);
        console.log('file: ', file);

        fileSpace = file;
        
        console.log('pathDetails: ', pathDetails);

        requestLogger(urlObject);

        

        response.writeHead(200, "OK", mime);

    } catch (err) {

        errorLogger(err);

        fileSpace = errorPage;

        switch (err.code) {

            case 'ENOENT': response.writeHead(404, new Error(err).message, 'text/html'); break;

            default: response.writeHead(500, new Error(err).message, 'text/html');

        }

    }

    response.end(fileSpace);

})
    .listen(8080)
)
    .catch(err => { throw new Error(msg.InitNotComplete) })

    .catch(err => { throw new Error(msg.InitNotComplete) })






