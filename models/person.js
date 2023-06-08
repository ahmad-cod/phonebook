const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to ', url)

mongoose.connect(url)
  .then(() => console.log('connected to mongodb'))
  .catch(err => console.log('error connecting to database', err.message))

const personSchema = mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'User name required'],
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: value => (value[2] === '-' || value[3] === '-'),
      message: 'Number must be of two parts that are separated by - the first part has two or three numbers'
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