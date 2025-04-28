require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./models/person')
const app = express()

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url).then(result => {
  console.log('connected to MongoDB')
}).catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))
app.use(cors())

app.get('/', (request, response) => {
    response.send('<h1>Phonebook API</h1>')
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(count => {
        const currentTime = new Date()
        response.send(
            `<p>Phonebook has info for ${count} people</p>
        <p>${currentTime}</p>`
        )
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    /**
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    */

    Person.findOne({ name: body.name })
        .then(existingPerson => {
            if (existingPerson) {
                return response.status(400).json({
                    error: 'name must be unique'
                })
            }

            const person = new Person({
                name: body.name,
                number: body.number
            })

            return person.save()
        })
        .then(savedPerson => {
            if (savedPerson) {
                response.json(savedPerson)
            }
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  
// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
  
    next(error)
}
  
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})