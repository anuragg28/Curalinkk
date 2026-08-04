import { Sidebar } from '../components/Sidebar'
import { ResearchWorkspace } from '../components/ResearchWorkspace'
import { appCopy } from '../data/curalinkMock'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useState, useEffect } from 'react'
import { sendChatPayload, getChatHistory } from '../api/chat'

function createConversationId() {
  return crypto.randomUUID()
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [conversationId, setConversationId] = useState(() => createConversationId())
  const [form, setForm] = useState({
    name: user?.name || '',
    disease: '',
    additionalQuery: '',
    location: '',
    focus: 'Treatments & therapies',
    query: '',
  })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('Ready for stage 5 and 6.')
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])

  const [isSidebarOpen, setSidebarOpen] = useState(false)
  
  useEffect(() => {
    getChatHistory()
      .then(res => setSessions(res.sessions || []))
      .catch(err => console.error('History Error:', err))
  }, [])

  function handleLogout() {
    signOut()
    navigate('/signin', { replace: true })
  }

  function handleFieldChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submitResearch(payload, nextConversationId) {
    setMessages((curr) => [...curr, { role: 'user', content: payload.query }])
    setSending(true)
    setStatus('Sending payload to /api/chat...')
    setSidebarOpen(false) // Close on mobile when starting

    try {
      const result = await sendChatPayload({
        conversationId: nextConversationId,
        ...payload,
      })
      setConversationId(result.conversationId)
      
      setMessages((curr) => [
        ...curr, 
        { 
          role: 'ai', 
          content: result.answer || '', 
          sourceCounts: result.sourceCounts || {},
          sources: result.sources || [],
        }
      ])

      setForm((curr) => ({ ...curr, query: '' }))
      setStatus(result.message)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setSending(false)
    }
  }

  async function handleStartSession() {
    const activeQuery = form.additionalQuery || form.query

    if (!form.name || !form.disease || !form.focus || !activeQuery) {
      setStatus('Please fill name, disease, focus, and additional query.')
      return
    }

    const nextConversationId = createConversationId()
    setConversationId(nextConversationId)
    setMessages([])

    await submitResearch(
      {
        name: form.name,
        disease: form.disease,
        query: activeQuery,
        location: form.location,
        focus: form.focus,
      },
      nextConversationId,
    )
  }

  async function handleSend() {
    const activeQuery = form.query

    if (!activeQuery) {
      setStatus('Please type a follow-up question before sending.')
      return
    }

    if (!form.name || !form.disease || !form.focus) {
      setStatus('Please fill patient context in the sidebar first.')
      return
    }

    await submitResearch(
      {
        name: form.name,
        disease: form.disease,
        query: activeQuery,
        location: form.location,
        focus: form.focus,
      },
      conversationId,
    )
  }

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] relative">
      <Sidebar
        copy={appCopy.sidebar}
        values={form}
        sessions={sessions}
        onFieldChange={handleFieldChange}
        onStartSession={handleStartSession}
        conversationId={conversationId}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ResearchWorkspace
        copy={appCopy.workspace}
        user={user}
        onLogout={handleLogout}
        query={form.query}
        onQueryChange={(value) => handleFieldChange('query', value)}
        onSend={handleSend}
        sending={sending}
        status={status}
        messages={messages}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />
    </main>
  )
}
