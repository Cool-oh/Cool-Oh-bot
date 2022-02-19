
import express from 'express'
import dotenv from 'dotenv'
import fs from 'fs'

const pingPort= Number(process.env.PING_PORT)
//const outputFile = process.env.ERROR_FILE 
const outputFile = './error.txt'
function writeErrorFile(data:any) {
	fs.appendFileSync(outputFile, data);
}

try {
  dotenv.config()
  const server = express()
  server.get("/ping", async (req, res) => {
    res.send("pong");
  })
  server.listen(pingPort,"0.0.0.0", () => {
    console.log("Server is ready..." )
  })
} catch (error) {
  writeErrorFile(error)
  console.log(error)
}


