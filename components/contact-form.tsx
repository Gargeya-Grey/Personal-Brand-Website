'use client';

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Send, CheckCircle2, RotateCcw, AlertCircle, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';

const projectTypes = [
  { id: 'ai-development', label: 'AI Development' },
  { id: 'venture-architecture', label: 'Venture Strategy' },
  { id: 'educational-evaluation', label: 'Education Redesign' },
  { id: 'consulting', label: 'Advisory / Consultancy' },
  { id: 'other', label: 'Other Inquiries' },
] as const;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'mailto';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'ai-development',
    details: '',
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mailtoHref, setMailtoHref] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setFormStatus('error');
        return;
      }

      if (data.delivery === 'mailto' && data.mailto) {
        setMailtoHref(data.mailto);
        setFormStatus('mailto');
        // Attempt to open mail client; user can also click manually
        window.location.href = data.mailto;
        return;
      }

      setFormStatus('success');
    } catch {
      setErrorMessage('Network error. Please email me directly or try again.');
      setFormStatus('error');
    }
  };

  const reset = () => {
    setFormData({ name: '', email: '', projectType: 'ai-development', details: '' });
    setFormStatus('idle');
    setErrorMessage('');
    setMailtoHref('');
  };

  if (formStatus === 'success' || formStatus === 'mailto') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="liquid-glass p-10 md:p-12 rounded-[2rem] text-center space-y-8 flex flex-col items-center justify-center min-h-[480px]"
      >
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3 max-w-md">
          <h3 className="text-2xl sm:text-3xl font-headline font-extrabold text-primary tracking-tight">
            {formStatus === 'mailto' ? 'Almost there' : 'Message received'}
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            {formStatus === 'mailto' ? (
              <>
                If your email client did not open, send me a note at{' '}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-bold text-accent hover:underline"
                >
                  {siteConfig.email}
                </a>
                , or use the button below.
              </>
            ) : (
              <>
                Thank you, <span className="font-bold text-primary">{formData.name}</span>. I
                typically reply within 24–48 hours about{' '}
                <span className="font-bold text-primary">
                  {projectTypes.find((p) => p.id === formData.projectType)?.label}
                </span>
                .
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {formStatus === 'mailto' && mailtoHref && (
            <a
              href={mailtoHref}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-slate-950 font-headline font-bold text-sm h-12 px-6 rounded-full tracking-tight transition-all active:scale-[0.98] shadow-md shadow-accent/15"
            >
              <ExternalLink className="w-4 h-4" /> Open email client
            </a>
          )}
          <button
            type="button"
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-primary dark:bg-white/10 text-white font-headline font-bold text-sm h-12 px-6 rounded-full tracking-tight transition-all active:scale-[0.98] border border-transparent dark:border-white/10"
          >
            <RotateCcw className="w-4 h-4" /> Send another
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="board-card rounded-[2rem] p-8 sm:p-10"
    >
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="contact-name"
              className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block"
            >
              Your Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              autoComplete="name"
              maxLength={120}
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-body text-primary placeholder-on-surface-variant/40 transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block"
            >
              Email Address
            </label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              maxLength={200}
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-body text-primary placeholder-on-surface-variant/40 transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block mb-3">
            Nature of Inquiry
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Inquiry type">
            {projectTypes.map((type) => {
              const selected = formData.projectType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setFormData({ ...formData, projectType: type.id })}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-headline text-sm font-semibold transition-all h-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    selected
                      ? 'bg-accent/10 text-primary dark:text-accent border-accent/40 dark:border-accent/60 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-on-surface-variant hover:bg-slate-100 hover:text-primary dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{type.label}</span>
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-accent" aria-hidden />}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-2">
          <label
            htmlFor="contact-details"
            className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block"
          >
            Project Context &amp; Details
          </label>
          <textarea
            id="contact-details"
            required
            rows={5}
            maxLength={8000}
            placeholder="What are you building, timeline, constraints, or the problem you want to solve..."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="min-h-[140px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-body text-primary placeholder-on-surface-variant/40 transition-colors focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-white/[0.04]"
          />
        </div>

        {formStatus === 'error' && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-700 dark:text-red-300 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p>{errorMessage}</p>
              <a href={`mailto:${siteConfig.email}`} className="underline font-semibold mt-1 inline-block">
                Email {siteConfig.email}
              </a>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={formStatus === 'submitting'}
          className="w-full h-14 bg-primary dark:bg-accent text-white dark:text-slate-950 font-headline font-bold text-sm tracking-tight hover:shadow-[0_4px_30px_rgba(16,185,129,0.25)] hover:bg-accent dark:hover:bg-accent/90 active:scale-[0.98] transition-all text-center rounded-xl flex items-center justify-center gap-3 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {formStatus === 'submitting' ? (
            <span>Sending…</span>
          ) : (
            <>
              <span>Send message</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
