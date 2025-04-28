const mongoose = require('mongoose')

mongoose.set('strictQuery',false)
/**
 * Connecting to url in index.js for some reason works, but not in person.js
const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url).then(result => {
  console.log('connected to MongoDB')
}).catch(error => {
  console.log('error connecting to MongoDB:', error.message)
})
*/

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d{7,8}/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)

/**

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
      })
}
*/
