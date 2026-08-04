const express = require('express')
const crypto = require('crypto')

const Conversation = require('../models/Conversation')
const {
  fetchPubMed,
  fetchOpenAlex,
  fetchTrials,
} = require('../services/searchFetchers')
const { expandSearchPayload } = require('../services/queryExpansion')
const { embedAll } = require('../services/embedder')
const { upsertEmbeddings } = require('../services/pinecone')
const { rankResults } = require('../services/ranker')
const { buildLlmPrompt } = require('../services/promptBuilder')
const { generateAnswer } = require('../services/llm')
const { loadConversationHistory } = require('../services/conversationHistory')

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const requiredEnvKeys = ['MONGODB_URI', 'JWT_SECRET', 'HF_TOKEN', 'PINECONE_API_KEY']
    const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key])

    if (missingEnvKeys.length) {
      return res.status(500).json({
        message: `Missing required backend env values: ${missingEnvKeys.join(', ')}`,
      })
    }

    const { conversationId, name, disease, location, focus, query } = req.body || {}

    if (!name || !disease || !focus || !query) {
      return res.status(400).json({
        message: 'name, disease, focus, and query are required',
      })
    }

    const nextConversationId = conversationId || crypto.randomUUID()
    const now = new Date()
    const cleanedQuery = query.trim()
    const cleanedDisease = disease.trim()
    const searchBundle = expandSearchPayload({
      query: cleanedQuery,
      disease: cleanedDisease,
      location,
      focus,
    })

    const [pubmedResults, openAlexResults, trialResults] = await Promise.all([
      fetchPubMed(searchBundle.publicationQuery, searchBundle.expandedQuery),
      fetchOpenAlex(searchBundle.openAlexQuery),
      fetchTrials(searchBundle.trialQuery, location?.trim?.() || ''),
    ])

    const rawPool = [...pubmedResults, ...openAlexResults, ...trialResults]
    const sourceCounts = {
      PubMed: pubmedResults.length,
      OpenAlex: openAlexResults.length,
      ClinicalTrials: trialResults.length,
    }
    let embeddedPool = []
    let topResults = []
    let pineconeWrite = null

    if (rawPool.length > 0) {
      embeddedPool = await embedAll(searchBundle.expandedQuery, rawPool)
      topResults = rankResults(embeddedPool)
      pineconeWrite = await upsertEmbeddings(nextConversationId, embeddedPool)
    }
    const history = await loadConversationHistory(nextConversationId)
    const patientContext = {
      name: name.trim(),
      disease: cleanedDisease,
      location: location?.trim?.() || '',
      focus: focus.trim(),
    }
    const { systemPrompt, userMessage } = buildLlmPrompt({
      query: cleanedQuery,
      top8: topResults,
      history,
      patientContext,
    })
    const answer = await generateAnswer({
      systemPrompt,
      userMessage,
    })

    const conversation = await Conversation.findOneAndUpdate(
      { conversationId: nextConversationId },
      {
        $setOnInsert: {
          conversationId: nextConversationId,
        },
        $set: {
          patient: {
            name: name.trim(),
            disease: cleanedDisease,
            location: location?.trim?.() || '',
            focus: focus.trim(),
          },
          lastQuery: searchBundle.expandedQuery,
          retrieval: {
            rawPoolCount: rawPool.length,
            topResults,
            sourceCounts,
          },
          answer,
          sources: topResults,
          updatedAt: now,
        },
        $push: {
          messages: {
            $each: [
              {
                role: 'user',
                content: cleanedQuery,
                createdAt: now,
              },
              {
                role: 'assistant',
                content: answer,
                sources: topResults,
                createdAt: now,
              },
            ],
          },
        },
      },
      {
        new: true,
        upsert: true,
      },
    )

    return res.json({
      message: 'Stage 10 response saved and returned',
      stage: 10,
      conversationId: conversation.conversationId,
      saved: true,
      answer,
      sources: topResults,
      expandedQuery: searchBundle.expandedQuery,
      publicationQuery: searchBundle.publicationQuery,
      openAlexQuery: searchBundle.openAlexQuery,
      trialQuery: searchBundle.trialQuery,
      historyCount: history.length,
      rawPoolCount: rawPool.length,
      sourceCounts,
      vectorStore: pineconeWrite,
      topResults,
      received: {
        conversationId: nextConversationId,
        name,
        disease,
        location,
        focus,
        query,
      },
    })
  } catch (error) {
    console.error(' [Chat Error]:', error)
    return res.status(500).json({
      message: error.message || 'Unable to process chat payload',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

router.get('/history', async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 })
      .limit(20)
      .select('conversationId patient updatedAt')
    
    return res.json({ sessions: conversations })
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Failed to fetch conversation history'
    })
  }
})

module.exports = router
