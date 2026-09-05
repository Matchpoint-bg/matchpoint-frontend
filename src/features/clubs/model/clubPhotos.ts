import type { Court } from '../../courts/model/court.types';
import type { Club } from './club.types';

/**
 * Every photo that belongs to a club, in the order a visitor should see them.
 *
 * The API has no club gallery: a club owns exactly one `header_image` and each
 * court owns its own `CourtImages` rows. So the club's own photo leads, then
 * the courts' — which is also roughly wide-shot before detail-shot.
 *
 * `gallery_urls` is honoured ahead of the courts in case the backend ever grows
 * a real gallery field; nothing populates it today.
 */
export function clubPhotos(club: Club | null | undefined, courts: Court[] = []): string[] {
  if (!club) return [];
  const urls = [
    club.thumbnail_url,
    ...(club.gallery_urls ?? []),
    ...courts.flatMap((court) => court.image_urls ?? []),
  ];
  // The same file can be both the club header and a court photo; show it once.
  return [...new Set(urls.filter((url): url is string => Boolean(url)))];
}
