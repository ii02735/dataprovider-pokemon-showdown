const scp = require('node-scp')
const glob = require("glob")


glob("./json/*.json", async function (er, files) {
    try{
        const client = await scp({
            host: process.env.REMOTE_HOST,
            port: process.env.REMOTE_PORT,
            username: process.env.REMOTE_USERNAME,
            password: process.env.REMOTE_PASSWORD
        })
        files.forEach(async (path) => {
            const filename = path.match(/[^\\/]+json/)[0]
            await client.uploadFile(path,`${process.env.REMOTE_DIR}/public/${filename}`)
        })
        client.close()
    }catch(e){
        console.log(e)
    }
})