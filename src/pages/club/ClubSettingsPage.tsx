import { Link } from 'react-router-dom';
import { ClubShell } from '../../app/layout/ClubShell';
import { EditClubModal, OpeningHoursEditor, useStaffClub } from '../../features/staff';
import { useI18n } from '../../i18n';
import { Button, Card, CardTitle, Icon, Select, useModal } from '../../shared/ui';
import { ClubGate } from './ClubGate';
import styles from './ClubPages.module.css';

/**
 * Club data and opening hours, plus the destinations the four-slot mobile tab
 * bar cannot show — this page is what its "More" tab opens.
 */
export function ClubSettingsPage() {
  const { t } = useI18n();
  const { openModal } = useModal();
  const { clubs, setClubId, refetch } = useStaffClub();

  return (
    <ClubShell title={t('nav_club_settings')}>
      <ClubGate>
        {(club) => (
          <>
            <Card padded>
              <CardTitle icon="gear">{t('club_details_card')}</CardTitle>
              <p className="small-note">{t('club_details_desc')}</p>
              <Button
                variant="outline"
                size="sm"
                icon="edit"
                onClick={() =>
                  openModal(t('edit_club'), <EditClubModal club={club} onDone={refetch} />)
                }
              >
                {t('edit_club')}
              </Button>
            </Card>

            <Card padded className={styles.card}>
              <CardTitle icon="clock">{t('hours_card')}</CardTitle>
              <p className="small-note">{t('hours_card_desc')}</p>
              <OpeningHoursEditor clubId={club.id} />
            </Card>

            {clubs.length > 1 && (
              <Card padded className={styles.card}>
                <CardTitle icon="ball">{t('staff_club_card')}</CardTitle>
                <p className="small-note">{t('staff_club_desc')}</p>
                <Select
                  value={String(club.id)}
                  aria-label={t('staff_club_card')}
                  onChange={(event) => setClubId(Number(event.target.value))}
                  options={clubs.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                />
              </Card>
            )}

            {/* The bottom bar holds Schedule/Bookings/Courts/More, so the
                remaining destinations live one tap away here. */}
            <nav className={styles.more} aria-label={t('club_workspace')}>
              <Link className={styles.link} to="/club">
                <Icon name="ball" />
                <span>{t('nav_club_overview')}</span>
              </Link>
              <Link className={styles.link} to="/club/team">
                <Icon name="users" />
                <span>{t('nav_club_team')}</span>
              </Link>
              <Link className={styles.link} to="/players">
                <Icon name="back" />
                <span>{t('back_to_player')}</span>
              </Link>
            </nav>
          </>
        )}
      </ClubGate>
    </ClubShell>
  );
}
