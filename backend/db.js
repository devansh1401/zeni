require('dotenv').config();
const mongoose = require("mongoose");

const CONNECTION_STRING = process.env.MONGODB_URI;

mongoose.connect(CONNECTION_STRING)
 .then(() => console.log('MongoDB connected successfully'))
 .catch(err => console.error('MongoDB connection error:', err));

 // Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
});


 const User = mongoose.model('User', userSchema);

 module.exports = {
    User
 }