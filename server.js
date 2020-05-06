/* NODEJS APP Server */

// Variable Declarations
const
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    path = require('path'),
    logDir = path.join(__dirname, 'logs'),
    publicDir = path.join(__dirname, 'public'),
    errorPage = fs.readFileSync(path.join(publicDir, 'error.html'), 'utf8'),
    logFile = path.join(logDir, 'log-' + getDate()),
    port = 3000;

// Fucntion expression declaration

!fs.existsSync(logDir) && fs.mkdirSync(logDir);

fs.writeFileSync(path.join(logFile), 'LOG STARTED ' + getDate() + '\n\n', 'utf8');

fs.readFile(path.join(__dirname, '.env'), function (err, fileBuffer) {
    const envFile = fileBuffer.toString().split('\n');
    if (err) {
        throw new Error(err)
    }
    for (let i = 0; i < envFile.length; i++) {
        console.log('envFile[i]: ', envFile[i]);
        process.env[envFile[i].split('=')[0]] = envFile[i].split('=')[1];
    }
})

function getDate() { return new Date().toLocaleString().replace(/\//g, '-').replace(/:/g, '_') };

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

            if (err) {
                errorLogger(err);
                response.statusCode = 500;
                errorPage
                    .replace('{{ERROR-CODE}}', '500')
                    .replace('{{ERROR-MESSAGE}}', err)
                response.end(errorPage);
            }

            // response.setHeader("Content-Type","text/html");
            response.statusCode = 200;
            response.write(fileBuffer);
            response.end();
        })

}).listen(port);


