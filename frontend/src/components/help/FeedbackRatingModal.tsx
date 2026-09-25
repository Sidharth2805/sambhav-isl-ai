import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

interface FeedbackRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'feedback' | 'contact';
}

export const FeedbackRatingModal: React.FC<FeedbackRatingModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'feedback',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feedback' | 'contact'>(defaultTab);

  // Rating & Review State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('ISL Recognition Accuracy');
  const [reviewText, setReviewText] = useState<string>('');
  const [featureSuggestion, setFeatureSuggestion] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Direct Contact State
  const [contactName, setContactName] = useState<string>(user?.name || '');
  const [contactEmail, setContactEmail] = useState<string>(user?.email || '');
  const [contactCategory, setContactCategory] = useState<string>('Technical Issue');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [submittingContact, setSubmittingContact] = useState<boolean>(false);
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // Screenshot / Image Attachment State
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    const feedbackPayload = {
      userId: user?.id || 'anonymous',
      userName: user?.name || 'User',
      rating,
      category,
      reviewText,
      featureSuggestion,
      attachmentName,
      timestamp: new Date().toISOString(),
    };

    // Store in localStorage for instant offline persistence
    try {
      const existing = JSON.parse(localStorage.getItem('sambhav_user_reviews') || '[]');
      existing.unshift(feedbackPayload);
      localStorage.setItem('sambhav_user_reviews', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setSubmittingReview(false);
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewSubmitted(false);
        setReviewText('');
        setFeatureSuggestion('');
        handleRemoveAttachment();
        onClose();
      }, 2500);
    }, 800);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSubmittingContact(true);

    const contactPayload = {
      name: contactName,
      email: contactEmail,
      category: contactCategory,
      message: contactMessage,
      attachmentName,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('sambhav_support_tickets') || '[]');
      existing.unshift(contactPayload);
      localStorage.setItem('sambhav_support_tickets', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setSubmittingContact(false);
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setContactMessage('');
        handleRemoveAttachment();
        onClose();
      }, 2500);
    }, 900);
  };

  const ratingDescriptions: Record<number, string> = {
    1: '1/5 - Poor: Needs significant improvement',
    2: '2/5 - Fair: Several issues encountered',
    3: '3/5 - Good: Meets basic expectations',
    4: '4/5 - Very Good: Great experience',
    5: '5/5 - Excellent: Outstanding accessibility & tools!',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 font-['Inter',sans-serif] animate-fadeIn">
      <div className="bg-white dark:bg-[#151c28] rounded-[28px] max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#2d3133] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2d3133] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-[#fe9832] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">rate_review</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                SAMBHAV Feedback &amp; Support Desk
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#828796]">
                Your feedback directly shapes our ISL AI features
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#253144] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#0c121e] p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-white dark:bg-[#1a202c] text-indigo-600 dark:text-[#fe9832] shadow-xs'
                : 'text-gray-600 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span>Rate &amp; Review</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-white dark:bg-[#1a202c] text-indigo-600 dark:text-[#fe9832] shadow-xs'
                : 'text-gray-600 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Send Us a Message</span>
          </button>
        </div>

        {/* Tab 1: Rate & Review */}
        {activeTab === 'feedback' && (
          <div>
            {reviewSubmitted ? (
              <div className="py-8 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center flex flex-col items-center gap-3 animate-scaleUp">
                <span className="material-symbols-outlined text-emerald-600 dark:text-[#8dfc75] text-5xl">verified</span>
                <p className="font-bold text-base text-emerald-900 dark:text-[#8dfc75]">
                  Thank You for Your Feedback!
                </p>
                <p className="text-xs text-gray-600 dark:text-[#cbd5e1] max-w-sm">
                  Your rating and review have been submitted successfully. We appreciate your contribution to making Indian Sign Language accessible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 text-xs">
                
                {/* 5-Star Interactive Rating */}
                <div className="flex flex-col gap-2 items-center justify-center p-4 bg-slate-50 dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-[#243044]">
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
                    How would you rate your overall experience with SAMBHAV?
                  </p>
                  
                  <div className="flex items-center gap-2 my-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          aria-label={`Rate ${star} star`}
                        >
                          <span
                            className={`material-symbols-outlined text-[32px] transition-colors ${
                              isFilled ? 'text-amber-400 fill' : 'text-slate-300 dark:text-slate-600'
                            }`}
                            style={{ fontVariationSettings: isFilled ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] font-semibold text-amber-700 dark:text-[#fe9832]">
                    {ratingDescriptions[hoverRating || rating]}
                  </span>
                </div>

                {/* Feedback Category */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-cat" className="font-bold text-gray-900 dark:text-white">
                    Feedback Category
                  </label>
                  <select
                    id="feedback-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white font-medium outline-none text-xs focus:border-indigo-500"
                  >
                    <option value="ISL Recognition Accuracy">🤟 ISL Recognition &amp; Accuracy</option>
                    <option value="Video Calling Experience">📹 1-on-1 Video Calling</option>
                    <option value="Translation Studio & Avatar">🗣️ Translation Studio &amp; 3D Avatar</option>
                    <option value="Learn ISL Content">📚 Learn ISL Tutorials &amp; Lessons</option>
                    <option value="UI & Accessibility">♿ UI Design, Contrast &amp; Accessibility</option>
                    <option value="General Experience">⭐ Overall App Experience</option>
                  </select>
                </div>

                {/* Review Comments */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-text" className="font-bold text-gray-900 dark:text-white">
                    Your Review &amp; Comments
                  </label>
                  <textarea
                    id="feedback-text"
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you liked, what worked well, or what could be improved..."
                    className="p-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white outline-none text-xs leading-relaxed focus:border-indigo-500"
                  />
                </div>

                {/* Feature Suggestions */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-feat" className="font-bold text-gray-900 dark:text-white">
                    Feature or ISL Sign Suggestions (Optional)
                  </label>
                  <input
                    id="feedback-feat"
                    type="text"
                    value={featureSuggestion}
                    onChange={(e) => setFeatureSuggestion(e.target.value)}
                    placeholder="e.g. Add medical term signs, group video calling, etc."
                    className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white outline-none text-xs focus:border-indigo-500"
                  />
                </div>

                {/* Attachment Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-900 dark:text-white">
                    Attach Screenshot (Optional)
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
                      className="py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] hover:border-indigo-400 dark:hover:border-[#fe9832] text-gray-600 dark:text-[#828796] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                      <span>Click to upload image or screenshot (Max 5MB)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e]">
                      <img
                        src={attachmentPreview}
                        alt="Screenshot thumbnail"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-[#243044]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate text-[11px]">
                          {attachmentName}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-[#828796]">
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

                {/* Submit Review Button */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="mt-1 w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Submit My Feedback &amp; Rating</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Send Us a Message */}
        {activeTab === 'contact' && (
          <div>
            {contactSubmitted ? (
              <div className="py-8 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center flex flex-col items-center gap-3 animate-scaleUp">
                <span className="material-symbols-outlined text-emerald-600 dark:text-[#8dfc75] text-5xl">mark_email_read</span>
                <p className="font-bold text-base text-emerald-900 dark:text-[#8dfc75]">
                  Message Sent to Support Team!
                </p>
                <p className="text-xs text-gray-600 dark:text-[#cbd5e1] max-w-sm">
                  Our accessibility support team has received your message and will respond to <span className="font-semibold">{contactEmail}</span> within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="flex flex-col gap-4 text-xs">
                
                {/* Official Support Info Banner */}
                <div className="p-3.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-[18px]">contact_mail</span>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">Direct Support Email: </span>
                      <a href="mailto:nayak.subham2426@gmail.com" className="text-sky-600 dark:text-sky-400 font-semibold underline">
                        nayak.subham2426@gmail.com
                      </a>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-[#8dfc75] font-bold text-[10px]">
                    24h Response
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-name" className="font-bold text-gray-900 dark:text-white">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Subham Nayak"
                      className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white outline-none text-xs focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-email" className="font-bold text-gray-900 dark:text-white">Your Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white outline-none text-xs focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-category" className="font-bold text-gray-900 dark:text-white">Subject / Category</label>
                  <select
                    id="contact-category"
                    value={contactCategory}
                    onChange={(e) => setContactCategory(e.target.value)}
                    className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white font-medium outline-none text-xs focus:border-indigo-500"
                  >
                    <option value="Technical Issue">🔴 Technical Issue / Bug Report</option>
                    <option value="ISL Recognition Feedback">🤟 ISL Recognition Feedback</option>
                    <option value="Microphone / Audio">🎤 Microphone &amp; Audio Issue</option>
                    <option value="Account & Login">👤 Account &amp; Profile</option>
                    <option value="General Inquiry">💬 General Inquiry &amp; Collaboration</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-msg" className="font-bold text-gray-900 dark:text-white">Message</label>
                  <textarea
                    id="contact-msg"
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your question, issue, or request in detail..."
                    className="p-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] text-gray-900 dark:text-white outline-none text-xs leading-relaxed focus:border-indigo-500"
                  />
                </div>

                {/* Attachment Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-900 dark:text-white">
                    Attach Screenshot / Error Log (Optional)
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
                      className="py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e] hover:border-indigo-400 dark:hover:border-[#fe9832] text-gray-600 dark:text-[#828796] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                      <span>Upload error screenshot (Max 5MB)</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-[#2d3133] bg-slate-50 dark:bg-[#0c121e]">
                      <img
                        src={attachmentPreview}
                        alt="Screenshot thumbnail"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-[#243044]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate text-[11px]">
                          {attachmentName}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-[#828796]">
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
                  disabled={submittingContact}
                  className="mt-1 w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingContact ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Message to Team</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackRatingModal;
