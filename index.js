require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person.js')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('req-body', req => {
  if(req.method === 'POST') return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people </p> <p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    console.log(persons)
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
  .then(person => res.json(person))
  .catch(err => next(err))
})

app.post('/api/persons', (req, res, next) => {
  console.log(req.body)
  const { name, number } = req.body

  const person = new Person({
      name,
      number
  })
  
  console.log(person)
  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(err => next(err))

})

app.delete('/api/persons/:id', (req, res, next) => {

  Person.findByIdAndRemove(req.params.id)
    .then(deletedPerson => res.status(204).end())
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  if(!name ||!number || (name =='')) {
    res.status(400).send({ error: 'Invalid name or number' })
  }
  
  Person.findByIdAndUpdate(req.params.id, {
    name,
    number
  }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(err => next(err))
  }
)

const unknownEndpoint = (req, res) => res.status(404).send({ error: 'unknown endpoint' })
// Handle unknown endpoints
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error:'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}
// Handle errors
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`)
})