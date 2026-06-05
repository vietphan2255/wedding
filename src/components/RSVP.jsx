import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { ref, push, serverTimestamp } from 'firebase/database'
import confetti from 'canvas-confetti'
import { db, isConfigured } from '../firebase/config.js'
import { useLanguage } from '../contexts/LanguageContext.jsx'
import FadeIn from './FadeIn.jsx'

function readAccent() {
  if (typeof window === 'undefined') return '#C97B5D'
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent')
    .trim()
  return v || '#C97B5D'
}

export default function RSVP() {
  const { t } = useLanguage()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      attending: 'yes',
      events: 'both',
      guests: '1',
    },
  })
  const [status, setStatus] = useState(null) // 'success' | 'error'
  const attending = watch('attending')
  const firedRef = useRef(false)

  useEffect(() => {
    if (status !== 'success' || firedRef.current) return
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    firedRef.current = true
    const accent = readAccent()
    const colors = [accent, '#FFD8E3', '#F4E4E1', '#C9A961']
    const fire = (origin) =>
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 45,
        origin,
        colors,
        scalar: 0.9,
        ticks: 200,
      })
    fire({ x: 0.2, y: 0.7 })
    window.setTimeout(() => fire({ x: 0.8, y: 0.7 }), 150)
    window.setTimeout(() => fire({ x: 0.5, y: 0.5 }), 300)
  }, [status])

  useEffect(() => {
    if (status !== 'success') firedRef.current = false
  }, [status])

  const onSubmit = async (data) => {
    try {
      if (isConfigured && db) {
        await push(ref(db, 'rsvps'), { ...data, createdAt: serverTimestamp() })
      } else {
        await new Promise((r) => setTimeout(r, 600))
        console.info('[demo] RSVP payload (no Firebase env vars):', data)
      }
      setStatus('success')
      reset()
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-muted focus:border-accent transition-colors'
  const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

  return (
    <section id="rsvp" className="section-padding relative bg-surface overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn className="text-center">
          <p className="eyebrow">{t('rsvp.eyebrow')}</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            {t('rsvp.title')}
          </h2>
          <div className="divider-leaf my-6">
            <span className="font-script text-2xl">{t('rsvp.divider')}</span>
          </div>
          <p className="text-muted">{t('rsvp.subtitle')}</p>
        </FadeIn>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-14 glass rounded-3xl p-10 md:p-14 text-center"
            >
              <CheckCircle2 size={48} className="text-accent mx-auto" />
              <h3 className="font-display text-3xl mt-4">
                {t('rsvp.success.title')}
              </h3>
              <p className="text-muted mt-3">{t('rsvp.success.body')}</p>
              <button
                onClick={() => setStatus(null)}
                className="btn-ghost mt-8"
              >
                ←
              </button>
            </motion.div>
          ) : (
            <FadeIn delay={0.1}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-14 glass rounded-3xl p-7 md:p-10 grid md:grid-cols-2 gap-5"
              >
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('rsvp.name')}</label>
                  <input
                    type="text"
                    className={fieldClass}
                    {...register('name', { required: true })}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {t('rsvp.validation.required')}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>{t('rsvp.phone')}</label>
                  <input
                    type="tel"
                    className={fieldClass}
                    {...register('phone')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>{t('rsvp.attending')}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['yes', t('rsvp.attending.yes')],
                      ['no', t('rsvp.attending.no')],
                    ].map(([v, lbl]) => (
                      <label
                        key={v}
                        className={`flex-1 min-w-[180px] cursor-pointer rounded-xl border px-4 py-3 text-center text-sm transition ${
                          attending === v
                            ? 'border-accent bg-bg text-ink'
                            : 'border-line bg-bg/60 text-muted hover:text-ink'
                        }`}
                      >
                        <input
                          type="radio"
                          value={v}
                          {...register('attending')}
                          className="sr-only"
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>

                {attending === 'yes' && (
                  <>
                    <div>
                      <label className={labelClass}>{t('rsvp.events')}</label>
                      <select className={fieldClass} {...register('events')}>
                        <option value="vuquy">{t('rsvp.events.vuquy')}</option>
                        <option value="thanhhon">
                          {t('rsvp.events.thanhhon')}
                        </option>
                        <option value="both">{t('rsvp.events.both')}</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>{t('rsvp.guests')}</label>
                      <select className={fieldClass} {...register('guests')}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className={labelClass}>{t('rsvp.message')}</label>
                  <textarea
                    rows={4}
                    className={fieldClass}
                    {...register('message')}
                  />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  {status === 'error' && (
                    <p className="text-sm text-red-500">{t('rsvp.error')}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary sm:ml-auto disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    {isSubmitting ? t('rsvp.submitting') : t('rsvp.submit')}
                  </button>
                </div>
              </form>
            </FadeIn>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
