/**
 * This little server is for local usages only.
 * In production mode, files are retrieved physically
 * from raw.githubusercontent.com
 */
const http = require("http")
const fs = require("fs")
http.createServer((req, res) => {
    fs.readFile(`json/${req.url}`, (err, data) => {
        if (!err) {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.write(data)
        } else {
            res.writeHead(400, { "Content-Type": "plain/text" })
            res.write(err.message)
        }
        res.end()
    })
}).listen(3500)