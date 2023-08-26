const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors')
connectToMongo();
const app = express()
const port = process.env.PORT || 5000


app.use(cors())

// Middleware to use response.body
app.use(express.json());

// Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => {
    res.send('Hello')
})

app.listen(port, () => {
    console.log(`iNotebook backend listening on http://localhost:${port}`)
})