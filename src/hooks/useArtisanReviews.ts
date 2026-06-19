import { useEffect, useState } from 'react';
import { fetchReviewsForArtisan, averageRating, type ReviewRecord } from '../core/reviews';

export function useArtisanReviews(artisanId: string | undefined) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!artisanId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError('');

    fetchReviewsForArtisan(artisanId)
      .then(rows => {
        if (mounted) {
          setReviews(rows);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('تعذّر تحميل المراجعات.');
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [artisanId]);

  return {
    reviews,
    loading,
    error,
    avgRating: averageRating(reviews),
    count: reviews.length,
  };
}
