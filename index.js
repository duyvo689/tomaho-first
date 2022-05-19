const express = require('express')
const app = express()
const path = require('path')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/form.html'))
})


const port = 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})