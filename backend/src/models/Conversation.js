const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      default: 'user',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sources: {
      type: [
        {
          title: String,
          abstract: String,
          authors: [String],
          year: Number,
          source: String,
          url: String,
          citationCount: Number,
          status: String,
          semanticScore: Number,
          recencyScore: Number,
          credibilityScore: Number,
          finalScore: Number,
        },
      ],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patient: {
      name: { type: String, trim: true },
      disease: { type: String, trim: true },
      location: { type: String, trim: true },
      focus: { type: String, trim: true },
    },
    lastQuery: {
      type: String,
      trim: true,
    },
    retrieval: {
      rawPoolCount: { type: Number, default: 0 },
      sourceCounts: {
        PubMed: { type: Number, default: 0 },
        OpenAlex: { type: Number, default: 0 },
        ClinicalTrials: { type: Number, default: 0 },
      },
      topResults: {
        type: [
          {
            title: String,
            abstract: String,
            authors: [String],
            year: Number,
            source: String,
            url: String,
            citationCount: Number,
            status: String,
            semanticScore: Number,
          },
        ],
        default: [],
      },
    },
    answer: {
      type: String,
      default: '',
    },
    sources: {
      type: [
        {
          title: String,
          abstract: String,
          authors: [String],
          year: Number,
          source: String,
          url: String,
          citationCount: Number,
          status: String,
          semanticScore: Number,
          recencyScore: Number,
          credibilityScore: Number,
          finalScore: Number,
        },
      ],
      default: [],
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Conversation', conversationSchema)
