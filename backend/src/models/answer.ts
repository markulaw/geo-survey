const mongoose = require("mongoose");

// Retrieve MongoDB connection URI from environment variables
const url = process.env.MONGODB_URI;

// Log connection URL
console.log("connecting to", url);

// Connect to MongoDB
mongoose
  .connect(url)
  .then((_result: any) => {
    console.log("connected to MongoDB");
  })
  .catch((error: any) => {
    console.log("error connecting to MongoDB:", error.message);
  });

// Define schema for answers
const answerSchema = new mongoose.Schema({
  surveyId: {
    type: Number,
    required: true,
  },
  user: {
    name: String,
    age: Number,
    gender: String,
  },
  answers: [
    {
      questionId: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        num: [
          "Polygon",
          "Point",
          "LineString",
          "Slider",
          "Images",
          "SingleChoice",
          "MultipleChoice",
          "SingleImage",
          "Table",
        ],
        required: true,
      },
      geoJSON: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
      zoomLevel: {
        type: Number,
        required: false,
      },
      sliderValue: {
        type: Number,
        required: false,
      },
      imagesChoose: {
        type: String,
        required: false,
      },
      singleChoice: {
        type: String,
        required: false,
      },
      multipleChoice: {
        type: String,
        required: false,
      },
      singleImage: {
        type: String,
        required: false,
      },
      table: {
        type: String,
        required: false,
      },
      timeSpent: {
        type: Number,
        required: false,
      },
      attempts: {
        type: Number,
        required: false,
      },
      timeOutsideTab: {
        type: Number,
        required: false,
      },
      zoomOuts: {
        type: Number,
        required: false,
      },
      zoomIns: {
        type: Number,
        required: false,
      },
      drags: {
        type: Number,
        required: false,
      },
      clicks: {
        type: Number,
        required: false,
      },
      timeStamps: {
        type: [Number],
        required: false,
      },
      inactivityPeriods: {
        type: [Number],
        required: false,
      }
    },
  ],
});

// Configure toJSON transformation
answerSchema.set("toJSON", {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Export model
module.exports = mongoose.model("Answer", answerSchema);
