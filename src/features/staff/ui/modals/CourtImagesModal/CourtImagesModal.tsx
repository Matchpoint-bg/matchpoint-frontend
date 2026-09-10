import { useI18n } from '../../../../../i18n';
import { ImageUpload } from '../../../../../shared/ui/ImageUpload';
import { useToast } from '../../../../../shared/ui/Toast';
import { useClubCourtsQuery } from '../../../../clubs';
import { useAddCourtImageMutation } from '../../../../courts';
import styles from '../StaffModal.module.css';
import ownStyles from './CourtImagesModal.module.css';

interface CourtImagesModalProps {
  clubId: number;
  courtId: number;
  onDone: () => void;
}

/**
 * Adds photos to a court. Unlike the club's single header image, a court holds
 * an unbounded list, so this appends rather than replaces.
 *
 * There is no delete endpoint for `CourtImages` and the rows carry no id, so
 * removal is not offered here — the note says where it can be done instead.
 */
export function CourtImagesModal({ clubId, courtId, onDone }: CourtImagesModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const addImage = useAddCourtImageMutation(courtId);
  // Read from the club's courts query rather than a `court` prop: the modal
  // element is created once when it opens, so a prop would still hold the
  // pre-upload image list. This is the cache entry CourtsManager already
  // filled, so it costs no extra request and refreshes on invalidation.
  const courtsQuery = useClubCourtsQuery(clubId);
  const images = courtsQuery.data?.find((court) => court.id === courtId)?.image_urls ?? [];

  // The modal stays open after a successful upload so several photos can be
  // added in a row, which is why `useStaffAction` (which closes it) is not used.
  const onSelect = async (file: File) => {
    try {
      await addImage.mutateAsync(file);
      toast(t('court_photo_added'), 'ok');
      onDone();
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'err');
      // Rethrow so ImageUpload drops the preview of a photo that never saved.
      throw error;
    }
  };

  return (
    <div>
      <p className={`small-note ${styles.intro}`}>{t('court_photos_desc')}</p>

      {images.length > 0 ? (
        <ul className={ownStyles.grid}>
          {images.map((url) => (
            <li key={url}>
              <img src={url} alt="" width="200" height="140" loading="lazy" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="small-note">{t('no_court_photos')}</p>
      )}

      <ImageUpload
        onSelect={onSelect}
        label={t('court_photo_add')}
        hint={t('club_photo_hint')}
        invalidFormatMessage={t('photo_invalid_format')}
        tooLargeMessage={t('photo_too_large')}
        busy={addImage.isPending}
      />

      <p className="small-note">{t('photo_delete_unavailable')}</p>
    </div>
  );
}
