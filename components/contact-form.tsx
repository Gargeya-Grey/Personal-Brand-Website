'use client';

import { useState } from 'react';
import * as motion from 'motion/react-client';
import { Send, CheckCircle2, RotateCcw } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'ai-development',
    details: '',
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => {
      setFormStatus('success');
    }, 1200);
  };

  const projectTypes = [
    { id: 'ai-development', label: 'AI Development' },
    { id: 'venture-architecture', label: 'Venture Strategy' },
    { id: 'educational-evaluation', label: 'Education Redesign' },
    { id: 'consulting', label: 'Advisory/Consultancy' },
    { id: 'other', label: 'Other Inquiries' },
  ];

  if (formStatus === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl p-10 md:p-12 border border-accent/20 dark:border-white/10 rounded-[2rem] shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)] text-center space-y-8 flex flex-col items-center justify-center min-h-[480px]"
      >
        <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center text-[#10B981] shadow-inner mb-2">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div className="space-y-3 max-w-md">
          <h3 className="text-2xl sm:text-3xl font-headline font-extrabold text-primary tracking-tight">
            Transmission Received
          </h3>
          <p className="text-on-surface-variant leading-relaxed">
            Thank you, <span className="font-bold text-primary">{formData.name}</span>. Your request regarding <span className="font-bold text-primary">{projectTypes.find(p => p.id === formData.projectType)?.label}</span> has been securely logged. Gargeya will review and reply within 24 hours.
          </p>
        </div>

        <button 
          onClick={() => {
            setFormData({ name: '', email: '', projectType: 'ai-development', details: '' });
            setFormStatus('idle');
          }}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 text-white font-headline font-bold text-sm h-12 px-6 rounded-full tracking-tight transition-all active:scale-95 shadow-md shadow-[#10B981]/15"
        >
          <RotateCcw className="w-4 h-4" /> Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white/30 dark:bg-white/[0.01] backdrop-blur-xl p-8 sm:p-10 border border-accent/20 dark:border-white/10 rounded-[2rem] shadow-[0_12px_24px_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2),_inset_0_2px_1px_rgba(255,255,255,0.15)]"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block">
              Your Name
            </label>
            <input 
              type="text" 
              required
              placeholder="Gargeya Sharma" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 px-4 bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/10 rounded-xl font-body text-primary focus:outline-none focus:border-[#10B981] placeholder-on-surface-variant/40 transition-colors"
            />
          </div>
 
          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block">
              Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="gargeya@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/10 rounded-xl font-body text-primary focus:outline-none focus:border-[#10B981] placeholder-on-surface-variant/40 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block">
            Nature of Inquiry
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, projectType: type.id })}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border font-headline text-sm font-semibold transition-all h-12 ${
                  formData.projectType === type.id
                    ? 'bg-[#10B981]/10 text-primary dark:text-[#10B981] border-[#10B981]/40 dark:border-[#10B981]/60 shadow-sm'
                    : 'bg-white/20 dark:bg-white/[0.01] border-white/50 dark:border-white/10 text-on-surface-variant hover:bg-white/40 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white hover:border-white dark:hover:border-white/20'
                }`}
              >
                <span>{type.label}</span>
                {formData.projectType === type.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-label uppercase tracking-wider text-primary font-extrabold block">
            Project Context &amp; Details
          </label>
          <textarea 
            required
            rows={5}
            placeholder="Tell us about your project, timeline, constraints, or the problem you're trying to solve..."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="w-full p-4 bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/10 rounded-xl font-body text-primary focus:outline-none focus:border-[#10B981] placeholder-on-surface-variant/40 resize-none transition-colors"
          />
        </div>

        <button 
          type="submit"
          disabled={formStatus === 'submitting'}
          className="w-full h-14 bg-primary dark:bg-accent text-white dark:text-slate-950 font-headline font-bold text-sm tracking-tight hover:shadow-[0_4px_30px_rgba(16,185,129,0.25)] hover:bg-[#10B981] dark:hover:bg-accent/90 focus:bg-[#10B981] dark:focus:bg-accent/90 active:scale-[0.98] transition-all text-center rounded-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {formStatus === 'submitting' ? (
            <span>Processing Dispatch...</span>
          ) : (
            <>
              <span>Transmit Message</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
