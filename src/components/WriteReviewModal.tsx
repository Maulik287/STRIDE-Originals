import React, { useState } from 'react';
import { Star, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Shoe, ShoeReview } from '../types';

interface WriteReviewModalProps {
  shoe: Shoe;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (shoeId: string, review: ShoeReview) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  shoe,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [fit, setFit] = useState<'runs_small' | 'true_to_size' | 'runs_large'>('true_to_size');
  const [comfortRating, setComfortRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [verifiedBuyer] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !title.trim()) return;

    const newReview: ShoeReview = {
      id: `rev-${Date.now()}`,
      author: author.trim(),
      rating,
      date: new Date().toISOString().split('T')[0],
      fit,
      comfortRating,
      verifiedBuyer,
      title: title.trim(),
      comment: comment.trim(),
      helpfulCount: 0,
      userVotedHelpful: false,
    };

    onSubmitReview(shoe.id, newReview);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-hidden"
      data-lenis-prevent="true"
    >
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95"
        data-lenis-prevent="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-neutral-900">
              Write a Verified Review
            </h3>
            <p className="text-xs text-neutral-500 truncate max-w-sm">
              Reviewing: <span className="font-semibold text-neutral-800">{shoe.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-display text-xl font-bold uppercase text-neutral-900">
              Review Published!
            </h4>
            <p className="text-xs text-neutral-600">
              Thank you! Your feedback helps other sneakerheads find their ideal fit.
            </p>
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit} 
            data-lenis-prevent="true"
            className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain"
          >
            {/* Star rating selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Overall Rating: <span className="text-amber-500 font-extrabold">{rating} / 5 Stars</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing Fit Meter Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                How does it fit on your feet?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'runs_small', label: 'Runs Small' },
                  { id: 'true_to_size', label: 'True to Size' },
                  { id: 'runs_large', label: 'Runs Large' },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => setFit(option.id as any)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      fit === option.id
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comfort Rating Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Comfort Score
                </label>
                <span className="text-xs font-bold text-neutral-900">{comfortRating} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={comfortRating}
                onChange={(e) => setComfortRating(parseInt(e.target.value, 10))}
                className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>Stiff / Flat</span>
                <span>Balanced</span>
                <span>Ultra Cloud-soft</span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Headline / Summary *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Most versatile sneaker I've ever owned"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Your In-Depth Experience *
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How does the leather or sole feel? How do you style them? Any sizing advice for buyers?"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
              ></textarea>
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Your Display Name *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Jordan V."
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Badge will be posted as <strong className="text-neutral-800">Verified Buyer</strong></span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Submit Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
