
import express from 'express'
import dotenv from 'dotenv'

const pingPort= Number(process.env.PING_PORT)

dotenv.config();
const server = express();
server.get("/ping", async (req, res) => {
    res.send("pong");
  })


server.listen(pingPort,"0.0.0.0", () => {
    console.log("Server is ready..." );

  })