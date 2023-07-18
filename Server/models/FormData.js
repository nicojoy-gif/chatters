const mongoose = require('mongoose')

const FormDataSchema = new mongoose.Schema({
   userId:{
    type: String,
    required:true
   },
   bio:{
    type: String,
    max:500
   },
   fullname: {
      type: String,
      max: 200
   },
   username: {
      type: String,
      max: 200
   },
   email:{
    type:String,
   },
   github:{
    type: String,
   },
   Linkedin:{
    type: String,
   },
   phone: {
    type: Number
   },
   country: {
    type: String
   },
   city: {
      type: String,
    
   },
   occupation: {
      type:String,
   }
  
},
{timestamps:true}
)

module.exports = mongoose.model('FormData', FormDataSchema)