// GROQ AI Service for Conversation Analysis
// This service provides AI-powered insights and analysis for Fiverr conversations

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroqAPI(messages, model, temperature, max_tokens) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens
    })
  });
  if (!response.ok) throw new Error('GROQ API error: ' + response.status);
  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function analyzeSentiment(messages) {
  try {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.body}`).join('\n');
    const prompt = `Analyze the following conversation and provide insights about:\n1. Overall sentiment (positive, negative, neutral)\n2. Communication tone (professional, casual, formal, friendly)\n3. Key topics discussed\n4. Communication patterns\n5. Potential issues or concerns\n6. Recommendations for better communication\n\nConversation:\n${conversationText}\n\nPlease provide a structured analysis with clear sections.`;
    const content = await callGroqAPI([
      { role: 'system', content: 'You are an expert communication analyst specializing in business conversations and client interactions. Provide clear, actionable insights.' },
      { role: 'user', content: prompt }
    ], 'llama3-8b-8192', 0.3, 1000);
    return { success: true, analysis: content, model: 'llama3-8b-8192' };
  } catch (error) {
    return { success: false, error: error.message, analysis: 'Unable to analyze conversation at this time.' };
  }
}

async function generateSummary(messages) {
  try {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.body}`).join('\n');
    const prompt = `Create a concise summary of this conversation that includes:\n1. Main topics discussed\n2. Key decisions or agreements made\n3. Action items or next steps\n4. Important details or requirements mentioned\n5. Overall conversation outcome\n\nConversation:\n${conversationText}\n\nProvide a clear, structured summary that would be useful for future reference.`;
    const content = await callGroqAPI([
      { role: 'system', content: 'You are a professional business analyst. Create clear, concise summaries that capture the essential information from conversations.' },
      { role: 'user', content: prompt }
    ], 'llama3-8b-8192', 0.2, 800);
    return { success: true, summary: content, model: 'llama3-8b-8192' };
  } catch (error) {
    return { success: false, error: error.message, summary: 'Unable to generate summary at this time.' };
  }
}

async function extractActionItems(messages) {
  try {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.body}`).join('\n');
    const prompt = `Extract all action items, tasks, deadlines, and commitments from this conversation. Format them as a structured list with:\n1. Task description\n2. Assigned person (if mentioned)\n3. Deadline (if mentioned)\n4. Priority level (high/medium/low)\n5. Status (pending/in progress/completed)\n\nConversation:\n${conversationText}\n\nReturn only the structured action items list.`;
    const content = await callGroqAPI([
      { role: 'system', content: 'You are a project management expert. Extract and organize action items from conversations in a clear, actionable format.' },
      { role: 'user', content: prompt }
    ], 'llama3-8b-8192', 0.1, 600);
    return { success: true, actionItems: content, model: 'llama3-8b-8192' };
  } catch (error) {
    return { success: false, error: error.message, actionItems: 'Unable to extract action items at this time.' };
  }
}

async function analyzeCommunicationEffectiveness(messages) {
  try {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.body}`).join('\n');
    const prompt = `Analyze the communication effectiveness of this conversation and provide insights on:\n1. Response times and engagement\n2. Clarity of communication\n3. Professionalism and tone\n4. Problem-solving approach\n5. Areas for improvement\n6. Communication strengths\n\nConversation:\n${conversationText}\n\nProvide specific, actionable feedback for improving communication.`;
    const content = await callGroqAPI([
      { role: 'system', content: 'You are a communication expert and business consultant. Provide constructive feedback on communication effectiveness.' },
      { role: 'user', content: prompt }
    ], 'llama3-8b-8192', 0.3, 800);
    return { success: true, effectiveness: content, model: 'llama3-8b-8192' };
  } catch (error) {
    return { success: false, error: error.message, effectiveness: 'Unable to analyze communication effectiveness at this time.' };
  }
}

async function generateInsights(messages) {
  try {
    const conversationText = messages.map(msg => `${msg.sender}: ${msg.body}`).join('\n');
    const prompt = `Provide comprehensive insights and recommendations for this conversation:\n1. Key insights about the interaction\n2. Business opportunities identified\n3. Risk factors or concerns\n4. Recommendations for follow-up\n5. Best practices demonstrated\n6. Areas for improvement\n\nConversation:\n${conversationText}\n\nProvide actionable insights that would be valuable for business development and relationship management.`;
    const content = await callGroqAPI([
      { role: 'system', content: 'You are a business development expert and relationship management specialist. Provide strategic insights and actionable recommendations.' },
      { role: 'user', content: prompt }
    ], 'llama3-8b-8192', 0.4, 1000);
    return { success: true, insights: content, model: 'llama3-8b-8192' };
  } catch (error) {
    return { success: false, error: error.message, insights: 'Unable to generate insights at this time.' };
  }
}

async function performComprehensiveAnalysis(messages) {
  try {
    const [sentiment, summary, actionItems, effectiveness, insights] = await Promise.all([
      analyzeSentiment(messages),
      generateSummary(messages),
      extractActionItems(messages),
      analyzeCommunicationEffectiveness(messages),
      generateInsights(messages)
    ]);
    return {
      success: true,
      analysis: {
        sentiment,
        summary,
        actionItems,
        effectiveness,
        insights,
        timestamp: new Date().toISOString(),
        messageCount: messages.length
      }
    };
  } catch (error) {
    return { success: false, error: error.message, analysis: null };
  }
}

// Make functions available globally for popup.js
window.performComprehensiveAnalysis = performComprehensiveAnalysis;
window.analyzeSentiment = analyzeSentiment;
window.generateSummary = generateSummary;
window.extractActionItems = extractActionItems;
window.analyzeCommunicationEffectiveness = analyzeCommunicationEffectiveness;
window.generateInsights = generateInsights; 