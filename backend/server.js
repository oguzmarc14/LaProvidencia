const app = require('./src/app')
const PORT = 3000

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en htpp://localhost:${PORT}`)
})

