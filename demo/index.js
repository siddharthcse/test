'use strict'

const path = require('path')
const express = require('express')
const app = express()
const docs = express()



app.use(express.static(path.resolve('build')))
app.use(express.static(path.resolve('demo')))

//Set views engine
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.get('/', (req, res) => {
  res.render('basic/basic')
});

app.listen(4000, () => {
  console.log('jmap demo listening on port 4000!');
});



docs.use(express.static(path.resolve('docs/out')))

docs.get('/docs', (req, res) => {
  res.sendFile(path.resolve('docs/out/index.html'))
});

docs.listen(4001, () => {
  console.log('jmap demo listening on port 4000!');
});