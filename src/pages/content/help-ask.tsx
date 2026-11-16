import { useMutation } from '@tanstack/react-query'
import { BotIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { api, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { helpPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

type Answer = components['schemas']['HelpChatAnswer']

/**
 * Ask a question, get the matching help article (chat-with-chatbot.md). Each question is answered on its own from an article the team
 * wrote, with no language model, so the box says so instead of pretending to be a conversation.
 */
export function HelpAsk() {
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState<{ question: string; answer: Answer } | null>(null)
  const ask = useMutation({
    mutationFn: async (q: string) => {
      // the help site is visited by sellers on the web; customers ask in the app
      const { data, error } = await api.POST('/api/help-articles/ask', { body: { question: q, audience: 'SELLER' } })
      if (error || !data) throw error
      return data
    },
    onSuccess: (answer, q) => {
      setAsked({ question: q, answer })
      setQuestion('')
    },
  })
  const valid = question.trim().length >= 2

  return (
    <section aria-labelledby="help-ask" className="flex flex-col gap-3 rounded-xl border p-5">
      <div className="flex items-center gap-2">
        <BotIcon className="size-5 text-primary" aria-hidden="true" />
        <h2 id="help-ask" className="text-body font-medium">
          {t('Hỏi nhanh')}
        </h2>
      </div>
      <p className="text-ui text-muted-foreground">{t('Trả lời tự động từ các bài trợ giúp của bonbon. Mỗi câu hỏi được trả lời riêng, không nhớ câu trước.')}</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) ask.mutate(question.trim())
        }}
      >
        <Input
          value={question}
          maxLength={300}
          placeholder={t('Ví dụ: khi nào tôi nhận được tiền?')}
          aria-label={t('Câu hỏi của bạn')}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button type="submit" disabled={!valid || ask.isPending} aria-label={t('Hỏi')}>
          <SendIcon />
        </Button>
      </form>
      {ask.isError ? <p className="text-ui text-destructive">{problemMessage(ask.error)}</p> : null}
      {asked ? (
        <div className="flex flex-col gap-2 rounded-lg bg-accent p-4" aria-live="polite">
          <p className="text-caption text-muted-foreground">{t('Bạn hỏi: ')}{asked.question}</p>
          {asked.answer.matched ? (
            <>
              <Link to={helpPath(`/articles/${asked.answer.articleId}`)} className="text-link text-body font-medium">
                {asked.answer.title}
              </Link>
              <p className="line-clamp-6 text-ui whitespace-pre-wrap">{asked.answer.answer}</p>
            </>
          ) : (
            <p className="text-ui">{asked.answer.answer}</p>
          )}
          {asked.answer.suggestions && asked.answer.suggestions.length > 0 ? (
            <div className="flex flex-col gap-1">
              <p className="text-caption text-muted-foreground">{t('Có thể bạn cũng cần:')}</p>
              {asked.answer.suggestions.map((s) => (
                <Link key={s.articleId} to={helpPath(`/articles/${s.articleId}`)} className="text-link text-ui">
                  {s.title}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
