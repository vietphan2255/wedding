import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useInvitedGuest } from '../contexts/InvitedGuestContext.jsx'
import { useWishes } from '../contexts/WishesContext.jsx'
import { useToast } from '../contexts/ToastContext.jsx'
import FadeIn from './FadeIn.jsx'
import SectionSubtitle from './SectionSubtitle.jsx'

export default function Wishes() {
  const { t } = useLanguage()
  const { found, invitationName } = useInvitedGuest()
  const { wishes, loading, submitWish } = useWishes()
  const toast = useToast()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  // Personalized link: prefill the name with the guest's invitation name (unless
  // they've already typed something).
  useEffect(() => {
    if (found && invitationName && !getValues('name')) {
      setValue('name', invitationName)
    }
  }, [found, invitationName, setValue, getValues])

  const onSubmit = async ({ name, message }) => {
    try {
      await submitWish({ name, message })
      reset()
      toast.success(t('wishes.toast.success'))
    } catch (err) {
      console.error(err)
      toast.error(t('wishes.toast.error'))
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-line bg-bg px-4 py-3 text-ink placeholder:text-muted focus:border-accent transition-colors'
  const labelClass = 'block text-[11px] tracking-[0.22em] uppercase text-muted mb-2'

  return (
    <section
      id="wishes"
      data-cursor-id="wishes"
      className="section-padding relative bg-bg overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-6">
        <FadeIn className="text-center">
          <p className="eyebrow">{t('wishes.eyebrow')}</p>
          <h2 className="font-display section-title">{t('wishes.title')}</h2>
          <SectionSubtitle text={t('wishes.subhead')} />
          <div className="divider-leaf section-divider">
            <Heart size={16} className="text-accent" />
          </div>
          <p className="text-muted section-desc">{t('wishes.subtitle')}</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-12 glass rounded-3xl p-6 md:p-8 grid md:grid-cols-3 gap-4"
          >
            <div>
              <label className={labelClass}>{t('wishes.name')}</label>
              <input
                type="text"
                className={fieldClass}
                {...register('name', { required: true, maxLength: 60 })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {t('rsvp.validation.required')}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>{t('wishes.message')}</label>
              <textarea
                rows={2}
                className={fieldClass}
                {...register('message', { required: true, maxLength: 400 })}
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1">
                  {t('rsvp.validation.required')}
                </p>
              )}
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-60"
              >
                <Send size={16} />
                {isSubmitting ? t('wishes.submitting') : t('wishes.submit')}
              </button>
            </div>
          </form>
        </FadeIn>

        <div className="mt-12 grid sm:grid-cols-2 gap-4 md:gap-5">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                aria-hidden
                className="rounded-2xl border border-line bg-surface p-5 animate-pulse"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-5 w-32 rounded-md bg-line/70" />
                  <div className="h-3.5 w-3.5 rounded-full bg-line/70" />
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3.5 w-full rounded-md bg-line/60" />
                  <div className="h-3.5 w-[88%] rounded-md bg-line/50" />
                  <div className="h-3.5 w-2/3 rounded-md bg-line/40" />
                </div>
                <div className="h-2.5 w-20 mt-4 rounded-md bg-line/50" />
              </div>
            ))}
          {!loading && wishes.length === 0 && (
            <p className="text-muted text-sm col-span-full text-center">
              {t('wishes.empty')}
            </p>
          )}
          <AnimatePresence initial={false}>
            {wishes.map((w) => (
              <motion.article
                key={w.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-display text-xl">{w.name}</h4>
                  <Heart size={14} className="text-accent mt-1 shrink-0" />
                </div>
                <p className="text-sm md:text-base text-ink/90 mt-2 leading-relaxed">
                  {w.message}
                </p>
                {w.createdAt && (
                  <p className="eyebrow text-[10px] mt-3">
                    {new Intl.DateTimeFormat('vi-VN', {
                      dateStyle: 'medium',
                    }).format(new Date(w.createdAt))}
                  </p>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
