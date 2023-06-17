const express = require("express");
const cors = require("cors");
const router = require("./src/router/route")
const port= 3030
const app = express()
require("./src/db/connection")

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
app.use(router)

app.listen(port ,()=>{
    console.log(`port run at ${port}`);
})