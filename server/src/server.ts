import express from "express";

const app = express();
const port = 3333

app.get('/healthcheck', (req, res) => {
    return res.send("OK")
})

app.listen(port);