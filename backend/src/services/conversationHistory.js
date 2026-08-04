const Conversation = require('../models/Conversation')

async function loadConversationHistory(conversationId) {
  const conversation = await Conversation.findOne({ conversationId })
    .select('messages')
    .lean()

  return conversation?.messages || []
}

module.exports = {
  loadConversationHistory,
}
