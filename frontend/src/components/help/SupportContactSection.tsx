import React, { useState, useRef } from 'react';

interface SupportContactSectionProps {
  initialSubject?: string;
  onSubmittedSuccess?: () => void;
}

export const SupportContactSection: React.FC<SupportContactSectionProps> = ({
  initialSubject = '',
  onSubmittedSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Communication & Calls');
  const [message, setMessage] = useState(initialSubject ? `Issue regarding: ${initialSubject}\n\n` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Image / Screenshot upload state
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }

      setAttachmentName(file.name);
      setAttachmentSize(`${(file.size / 1024).toFixed(1)} KB`);

      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setAttachmentPreview(loadEvt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentPreview(null);
    setAttachmentName(null);
    setAttachmentSize(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);

    try {
      const ticketPayload = {
        name,
        email,
        category,
        message,
        attachmentName,
        timestamp: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem('sambhav_support_tickets') || '[]');
      existing.unshift(ticketPayload);
      localStorage.setItem('sambhav_support_tickets', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      if (onSubmittedSuccess) onSubmittedSuccess();
      setTimeout(() => {
        setName('');
        setEmail('');
        setMessage('');
        handleRemoveAttachment();
        setSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div id="support-contact-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Direct Contact Information Window (5 cols) */}
      <section className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white dark:bg-[#151c28] rounded-3xl p-6 sm:p-7 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#243044] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fe9832]/10 text-[#fe9832] flex items-center justify-center font-bold shadow-inner">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <h2 className="text-base font-black text-[#030813] dark:text-white">
                  Direct Contact Information
                </h2>
                <p className="text-[11px] text-[#45474c] dark:text-[#828796]">
                  Reach out to our accessibility team
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#8dfc75] bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Active Desk
            </span>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            {/* Email Support */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] flex items-start gap-3.5 group hover:border-[#fe9832] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#fe9832]/10 text-[#fe9832] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#030813] dark:text-white">Support &amp; Escalation Email</p>
                <a
                  href="mailto:nayak.subham2426@gmail.com"
                  className="text-xs font-semibold text-[#fe9832] hover:underline block truncate mt-0.5"
                >
                  nayak.subham2426@gmail.com
                </a>
                <p className="text-[10px] text-[#45474c] dark:text-[#828796] mt-0.5">Direct Developer &amp; Team Support</p>
              </div>
            </div>

            {/* Helpline Phone */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] flex items-start gap-3.5 group hover:border-[#8dfc75] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#8dfc75] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">call</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#030813] dark:text-white">Accessibility Helpline</p>
                <p className="text-xs font-bold text-[#030813] dark:text-white mt-0.5">
                  1800-SAMBHAV
                </p>
                <p className="text-[10px] text-[#45474c] dark:text-[#828796] mt-0.5">Mon - Sat, 9:00 AM to 7:00 PM IST (Toll-Free)</p>
              </div>
            </div>

            {/* Linguistic / ISLRTC Advisors */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#030813] dark:text-white">ISL Certified Interpreters</p>
                <p className="text-[11px] text-[#45474c] dark:text-[#828796] mt-0.5 leading-relaxed">
                  Deaf educator consultations and certified linguistic evaluations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#f8fafc] dark:bg-[#0c121e] rounded-2xl border border-[#e0e3e5] dark:border-[#243044] text-[11px] text-[#45474c] dark:text-[#828796] leading-relaxed flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#fe9832] shrink-0">location_on</span>
            <span>SAMBHAV ISL AI Initiative, Bhubaneswar, Odisha - 751030</span>
          </div>
        </div>
      </section>

      {/* Priority Ticket Submission Form (7 cols) */}
      <section className="lg:col-span-7 bg-white dark:bg-[#151c28] rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col justify-between gap-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-black text-[#030813] dark:text-white">
              Submit a Support Ticket
            </h2>
            <span className="text-[10px] font-bold text-[#fe9832] bg-[#fe9832]/10 px-2.5 py-0.5 rounded-full border border-[#fe9832]/20">
              Escalation Desk
            </span>
          </div>
          <p className="text-xs text-[#45474c] dark:text-[#828796] mb-5">
            If our self-service troubleshooting didn&apos;t resolve your issue, send us the details for priority assistance.
          </p>

          {submitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center flex flex-col items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 dark:text-[#8dfc75] text-4xl">check_circle</span>
              <p className="font-bold text-sm text-emerald-800 dark:text-[#8dfc75]">
                Ticket Submitted Successfully!
              </p>
              <p className="text-xs text-[#45474c] dark:text-[#c1c6d7]">
                A support specialist has been assigned to your ticket and will email you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticket-name" className="font-bold text-[#030813] dark:text-white">Your Name</label>
                  <input
                    id="ticket-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Subham Nayak"
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs text-[#030813] dark:text-white focus:border-[#fe9832] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ticket-email" className="font-bold text-[#030813] dark:text-white">Email Address</label>
                  <input
                    id="ticket-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs text-[#030813] dark:text-white focus:border-[#fe9832] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticket-category" className="font-bold text-[#030813] dark:text-white">Problem Category</label>
                <select
                  id="ticket-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs text-[#030813] dark:text-white focus:border-[#fe9832] outline-none"
                >
                  <option value="Communication & Calls">🔴 Communication &amp; Calls (Live Video)</option>
                  <option value="ISL Translation & Avatar">🤟 ISL Translation &amp; Avatar</option>
                  <option value="Speech & Microphone">🎤 Speech &amp; Microphone</option>
                  <option value="Account & Login">👤 Account, Login &amp; Password</option>
                  <option value="News & Media">📰 News &amp; Media</option>
                  <option value="Other">❓ Other Technical Issue</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="ticket-desc" className="font-bold text-[#030813] dark:text-white">Describe Your Issue</label>
                <textarea
                  id="ticket-desc"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe what happened, what device or browser you are using, and any error messages..."
                  className="w-full p-3.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs text-[#030813] dark:text-white focus:border-[#fe9832] outline-none leading-relaxed"
                />
              </div>

              {/* Attachment Section */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#030813] dark:text-white">
                  Attach Error Screenshot (Optional)
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!attachmentPreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-dashed border-[#e0e3e5] dark:border-[#243044] bg-[#f8fafc] dark:bg-[#0c121e] hover:border-[#fe9832] text-[#45474c] dark:text-[#828796] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                    <span>Click to attach image or screenshot (Max 5MB)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-[#e0e3e5] dark:border-[#243044] bg-[#f8fafc] dark:bg-[#0c121e]">
                    <img
                      src={attachmentPreview}
                      alt="Screenshot preview"
                      className="w-12 h-12 object-cover rounded-lg border border-[#e0e3e5] dark:border-[#243044]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#030813] dark:text-white truncate text-[11px]">
                        {attachmentName}
                      </p>
                      <p className="text-[10px] text-[#45474c] dark:text-[#828796]">
                        {attachmentSize}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      title="Remove attachment"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-3 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 text-[#542900] font-black text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                ) : (
                  <>
                    <span>Submit Priority Ticket</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};

export default SupportContactSection;
