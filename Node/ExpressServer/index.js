const express = require("express")
const app = express()


app.get("/doggy", (req, res) => {
    res.send("Doggy")
})

app.listen(3000)
