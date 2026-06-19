import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, CheckCircle, MessageCircle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speak, toEasternArabic } from '../core/utils';
import { PageHeader, BookingListSkeleton } from '../components/ui';
import { useArtisanReviews } from '../hooks/useArtisanReviews';

const MOCK_ARTISANS: Record<string, { name: string; specialty: string; experience: number }> = {
  '1': { name: 'أحمد محمد', specialty: 'خبير صيانة تكييف', experience: 8 },
  '2': { name: 'محمود علي', specialty: 'فني تنظيف شامل', experience: 5 },
  '3': { name: 'سيد رجب', specialty: 'صيانة وتأسيس', experience: 12 },
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-accent fill-accent' : 'text-border'}`}
        />
      ))}
    </div>
  );
}

export default function ArtisanPortfolio() {
  const { id } = useParams<{ id: string }>();
  const { i18n } = useTranslation();
  const artisanId = id ?? '1';
  const profile = MOCK_ARTISANS[artisanId] ?? MOCK_ARTISANS['1'];
  const { reviews, loading, error, avgRating, count } = useArtisanReviews(artisanId);

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    speak(text, i18n.language);
  };

  const displayRating = count > 0 ? toEasternArabic(avgRating) : '—';

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PageHeader
        title="الملف الشخصي للحرفي"
        onSpeak={e => handleSpeak(e, 'الملف الشخصي للحرفي')}
      />

      <div className="main-content-scroll p-5 pb-12">
        <div className="bg-bg-card border border-border/50 rounded-[24px] p-6 shadow-card mb-6 text-center relative overflow-hidden">
          <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-accent/8 blur-2xl pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-border mx-auto mb-4 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-accent/30 to-text-secondary/20" />
            <div className="absolute -bottom-1 -end-1 bg-success text-white p-1 rounded-full border-2 border-bg-card">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text-primary flex items-center justify-center gap-2">
            {profile.name}
            <button onClick={e => handleSpeak(e, profile.name)} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h2>
          <p className="text-text-secondary text-sm mt-1">{profile.specialty}</p>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-text-primary font-bold">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{displayRating}</span>
              </div>
              <span className="text-[10px] text-text-secondary mt-0.5">التقييم</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-text-primary font-bold text-sm">{toEasternArabic(count)}</span>
              <span className="text-[10px] text-text-secondary mt-0.5">المراجعات</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-text-primary font-bold text-sm">{toEasternArabic(profile.experience)}</span>
              <span className="text-[10px] text-text-secondary mt-0.5">سنوات خبرة</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            معرض الأعمال
            <button onClick={e => handleSpeak(e, 'معرض الأعمال')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(item => (
              <div
                key={item}
                className="aspect-square bg-bg-primary rounded-xl border border-border/60 relative overflow-hidden shadow-sm flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 to-text-primary/5" />
                <span className="relative text-[10px] font-bold text-text-secondary">قريباً</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-lg text-text-primary mb-4 flex items-center gap-2">
            أحدث المراجعات
            <button onClick={e => handleSpeak(e, 'أحدث المراجعات')} aria-label="استمع" className="btn-speak">
              <Volume2 className="w-4 h-4 text-text-secondary" />
            </button>
          </h3>

          {error && (
            <p className="text-danger text-sm font-bold mb-3">{error}</p>
          )}

          {loading ? (
            <BookingListSkeleton count={2} />
          ) : reviews.length === 0 ? (
            <div className="glass-card rounded-[20px] p-6 text-center border border-border/40">
              <p className="text-sm font-bold text-text-secondary">لا توجد مراجعات بعد — كن أول من يقيّم!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className="glass-card border border-border/50 rounded-[20px] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-text-primary">{review.userName}</span>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 bg-bg-card border-t border-border shadow-[var(--shadow-bottom-bar)]">
        <button
          type="button"
          className="w-full bg-[#25D366] text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300 shadow-md active:scale-95"
        >
          <MessageCircle className="w-6 h-6" />
          تواصل عبر واتساب
        </button>
      </div>
    </div>
  );
}
