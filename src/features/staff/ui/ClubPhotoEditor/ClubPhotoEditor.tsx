import { useI18n } from '../../../../i18n';
import { ImageUpload } from '../../../../shared/ui/ImageUpload';
import { useToast } from '../../../../shared/ui/Toast';
import { useUploadClubImageMutation } from '../../../clubs';
import type { Club } from '../../../clubs';

/**
 * The club's single header photo. A club has one `header_image`, not a gallery,
 * so uploading again replaces what is there — the copy says "replace" once a
 * photo exists to make that obvious before the click.
 */
export function ClubPhotoEditor({ club }: { club: Club }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const upload = useUploadClubImageMutation(club.id);

  // Not routed through `useStaffAction`: this editor sits on a page rather than
  // in a modal, and that hook closes the modal on success.
  const onSelect = async (file: File) => {
    try {
      await upload.mutateAsync(file);
      toast(t('club_photo_updated'), 'ok');
    } catch (error) {
      toast(error instanceof Error ? error.message : String(error), 'err');
      // Rethrow so ImageUpload drops the preview of a photo that never saved.
      throw error;
    }
  };

  return (
    <ImageUpload
      onSelect={onSelect}
      previewUrl={club.thumbnail_url}
      label={club.thumbnail_url ? t('club_photo_replace') : t('club_photo_upload')}
      hint={t('club_photo_hint')}
      invalidFormatMessage={t('photo_invalid_format')}
      tooLargeMessage={t('photo_too_large')}
      busy={upload.isPending}
    />
  );
}
