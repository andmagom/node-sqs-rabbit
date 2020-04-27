const express = require('express')
const bodyParser = require('body-parser');
const sqsSend = require('./sqs');
const rabbit = require('./rabbit');

const port = 3000

const app = express()
app.use(bodyParser.json())

app.post('/sqs/send', (req, res) => { 
  sqsSend.send(req.body)
    .then(data => res.status(200).json({messageId:data}))
    .catch( err => console.log(err));
})

app.get('/sqs/get', (req, res) => { 
  sqsSend.get(req.body)
    .then(data => res.status(200).json({status: "ok"}))
    .catch( err => console.log(err));
})

app.post('/rabbit/send', (req, res) => { 
  rabbit.send(req.body)
    .then( () => res.status(200).send())
    .catch( err => console.log(err));
})

app.get('/rabbit/get', (req, res) => { 
  rabbit.get(req.body)
    .then( () => res.status(200).json({status: "ok"}))
    .catch( err => console.log(err));
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))