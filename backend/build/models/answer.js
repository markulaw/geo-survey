"use strict";
const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;
console.log('connecting to', url);
mongoose
    .connect(url)
    .then((_result) => {
    console.log('connected to MongoDB');
})
    .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
});
const answerSchema = new mongoose.Schema({
    surveyId: {
        type: Number,
        required: true,
    },
    user: {
        name: String,
        age: Number,
        gender: String,
        residencePlace: String,
    },
    answers: [
        {
            questionId: {
                type: Number,
                required: true,
            },
            type: {
                type: String,
                num: ['Polygon', 'Point', 'LineString', 'Slider', 'Images'],
                required: true,
            },
            geoJSON: {
                type: mongoose.Schema.Types.Mixed,
                required: true,
            }
        },
    ],
});
answerSchema.set('toJSON', {
    transform: (_document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
module.exports = mongoose.model('Answer', answerSchema);
