const express = require("express")
const app = express()
const fs = require("fs")
const path = require("path")

app.get("/:json_file",(req,res) => {
    
    fs.readFile(path.join("json",`${req.params.json_file}.json`),(err,data) => {
        if(err)
            res.status(404).json({ "error": `${req.params.json_file} JSON resource not found` })
        else
            res.json(JSON.parse(data))    
    })
})

/**
 * PORT env variable for Heroku
 * else 3000 for development
 */

app.listen(process.env.PORT || 3000)