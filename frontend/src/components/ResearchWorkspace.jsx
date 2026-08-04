import { Composer } from './Composer'
import { AnswerBubble } from './AnswerBubble'
import { SourceTags } from './SourceTags'
import { WorkspaceHeader } from './WorkspaceHeader'
import { useRef, useEffect } from 'react'

export function ResearchWorkspace({
  copy,
  user,
  onLogout,
  query,
  onQueryChange,
  onSend,
  sending,
  status,
  messages = [],
  onToggleSidebar,
}) {
  const isStarted = messages.length > 0 || sending
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, sending])

  return (
    <section className="flex flex-col flex-1 min-w-0 bg-[var(--bg-base)]">
      <WorkspaceHeader user={user} onLogout={onLogout} onToggleSidebar={onToggleSidebar} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto w-full flex flex-col relative group">
        {!isStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-[800px] w-full mx-auto my-auto text-center">
            <div className="w-[48px] h-[48px] rounded-[16px] bg-[var(--accent-dim)] flex items-center justify-center shrink-0 mb-6 border border-[var(--accent)]/20 shadow-[0_0_40px_rgba(0,200,150,0.1)]">
              <span className="text-[var(--accent)] text-[24px] font-bold">C</span>
            </div>
            <h2 className="text-[20px] font-medium text-[var(--text-primary)] mb-2">
              What would you like to research today?
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] mb-10">
              Fill in your patient context and start a session
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {["Latest lung cancer treatments", "Clinical trials for diabetes", "Alzheimer's research 2024"].map(chip => (
                <button
                  key={chip}
                  className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full px-[16px] py-[8px] text-[13px] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-primary)] focus:outline-none"
                  onClick={() => onQueryChange(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 px-[48px] py-[32px] max-w-[900px] mx-auto w-full pb-20">
            {messages.map((msg, index) => {
              if (msg.role === 'user') {
                return (
                  <div key={index} className="flex justify-end mt-2 animate-fade-slide-up">
                    <div className="bg-[var(--accent)] text-[#0A0A0F] rounded-[18px_18px_4px_18px] px-[18px] py-[12px] text-[14px] leading-[1.6] max-w-[72%] shadow-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                )
              }

              if (msg.role === 'ai') {
                return (
                  <div key={index} className="flex flex-col mt-4 animate-fade-slide-up">
                    <div className="flex gap-4">
                      <div className="w-[32px] h-[32px] rounded-full flex shrink-0 items-center justify-center text-[11px] font-bold text-white shadow-sm mt-[2px] bg-[linear-gradient(135deg,#00C896,#4D8EFF)]">
                        AI
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex flex-col gap-6 text-[14px] leading-[1.8] text-[var(--text-primary)]">
                          <AnswerBubble answer={msg.content} sources={msg.sources || []} />
                          <SourceTags sourceCounts={msg.sourceCounts} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}

            {sending && (
              <div className="flex flex-col mt-4 animate-fade-slide-up">
                <div className="flex gap-4">
                  <div className="w-[32px] h-[32px] rounded-full flex shrink-0 items-center justify-center text-[11px] font-bold text-white shadow-sm mt-[2px] bg-[linear-gradient(135deg,#00C896,#4D8EFF)]">
                    AI
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-[4px] h-[36px] px-2 text-[var(--accent)]">
                      <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse"></span>
                      <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse delay-100"></span>
                      <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse delay-200"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Composer
        label={copy.queryLabel}
        placeholder={copy.queryPlaceholder}
        value={query}
        onChange={onQueryChange}
        onSend={onSend}
        loading={sending}
        status={status}
      />
    </section>
  )
}
