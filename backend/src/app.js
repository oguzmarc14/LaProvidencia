const express = require('express')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'la api esta funcionando :)'
    })
})

module.exports = app

