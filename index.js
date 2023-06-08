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

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
  .then(person => res.json(person))
  .catch(err => res.status(404).json({ error: err.message }))
})

app.post('/api/persons', (req, res) => {
  console.log(req.body)
  const { name, number } = req.body
  if(!name || !number || (name == ' ')) {
    res.status(400).send({ error: 'Invalid name or number' })
    return
  }
  
  // check if name is already in the phonebook
  // const duplicatePerson = persons.find(p => p.name === name)
  // if (duplicatePerson) {
  //   res.status(400).send({ error: 'Name must be unique' })
  //   return
  // }

  const person = new Person({
      name,
      number
  })
  
  console.log(person)
  person.save()
    .then(savedPerson => res.json(savedPerson))
    .catch(err => res.status(404).json({ error: err.message }))

})

app.delete('/api/persons/:id', (req, res) => {
    const id = parseInt(req.params.id, 10)

    console.log(id)
    const person = persons.find(p => p.id === id)
    
    if (person) {
        persons = persons.filter(p => p.id !== id);
        res.status(204).end()
        return
        
    } else {
        console.log("couldn't find person", id)
        res.status(404).end()
    }
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`)
})