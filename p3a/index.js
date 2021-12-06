const express = require('express')
const cors = require('cors')
const env = require('dotenv').config()
const Person = require ('./models/person')

const password = process.env.password
const morgan = require('morgan')
const person = require('./models/person')
const app = express()

app.use(express.json())
app.use(express.static('build'))
morgan.token('body', (req, res)=> JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info',(request, response) => {
  Person.count({}).then(length => {
    response.send(` <p>Phonebook has info for ${length}</p>
                    <p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if(person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number : body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, {
    new : true
  })
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)
  const People = new Person({
      name : body.name,
      number : body.number
    })

    People
    .save()
    .then(savedPerson =>{
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  } else if ( error.name === "ValidationError") {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
