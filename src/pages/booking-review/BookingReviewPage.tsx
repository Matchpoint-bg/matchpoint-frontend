import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { useAuth } from '../../features/auth';
import {
  forgetIntent,
  intentFromParams,
  rememberIntent,
  useBookSlots,
  validateIntent,
} from '../../features/booking';
import type { IntentProblem } from '../../features/booking';
import { useClubQuery } from '../../features/clubs';
import { useAvailabilityQuery, useCourtQuery } from '../../features/courts';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n/en';
import { fmt } from '../../shared/lib/format';
import {
  BackLink,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  Icon,
  SectionHeader,
  Spinner,
  SurfaceBadge,
} from '../../shared/ui';
import styles from './BookingReviewPage.module.css';

const PROBLEM_TITLE: Record<IntentProblem, TranslationKey> = {
  past: 'intent_past_title',
  missing: 'intent_missing_title',
  taken: 'intent_taken_title',
  repriced: 'intent_repriced_title',
};

const PROBLEM_DESC: Record<IntentProblem, TranslationKey> = {
  past: 'intent_past_desc',
  missing: 'intent_missing_desc',
  taken: 'intent_taken_desc',
  repriced: 'intent_repriced_desc',
};

/**
 * The step between picking slots and owning them (ToDoRedesign §10).
 *
 * It holds no state of its own: the intent comes from the URL, and everything
 * shown about it is re-read from the API, so a refresh, a Back navigation or a
 * return from the auth detour all rebuild the same page. Nothing here books —
 * only the CTA does, and only once.
 */
export function BookingReviewPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { authed } = useAuth();

  const intent = useMemo(() => intentFromParams(params), [params]);

  // NaN rather than 0 for a missing intent: the query helpers treat a
  // non-finite id as "nothing to fetch", so no request goes out for court 0.
  const clubQuery = useClubQuery(intent?.clubId ?? Number.NaN);
  const courtQuery = useCourtQuery(intent?.courtId ?? Number.NaN);
  const availabilityQuery = useAvailabilityQuery(intent?.courtId ?? Number.NaN, intent?.date ?? '');
  const { book, pending } = useBookSlots();

  // Re-validated on every render against whatever availability last returned,
  // so a slot taken while the player was reading is caught before the CTA.
  const check = useMemo(
    () => (intent ? validateIntent(intent, availabilityQuery.data ?? [], new Date()) : null),
    [availabilityQuery.data, intent],
  );

  if (!intent) {
    return (
      <AppShell active="clubs">
        <EmptyState title={t('intent_gone_title')} desc={t('intent_gone_desc')} icon="info">
          <Button variant="primary" icon="ball" onClick={() => navigate('/players')}>
            {t('go_to_clubs')}
          </Button>
        </EmptyState>
      </AppShell>
    );
  }

  const clubPath = `/clubs/${intent.clubId}?date=${intent.date}`;
  const loading = clubQuery.isPending || courtQuery.isPending || availabilityQuery.isPending;
  const club = clubQuery.data;
  const court = courtQuery.data;
  const problem = check?.problem ?? null;
  const price = check?.price ?? intent.price;

  const onContinue = () => {
    if (!authed) {
      // The URL already carries the intent; the copy is only for an external
      // identity provider that reloads the app out from under us.
      rememberIntent(intent);
      navigate('/login', { state: { from: location, reason: 'booking' } });
      return;
    }
    const first = check?.run[0];
    const last = check?.run[check.run.length - 1];
    if (!first || !last) return;
    void book({
      courtId: intent.courtId,
      first,
      last,
      total: price,
      date: intent.date,
      onDone: forgetIntent,
    });
  };

  return (
    <AppShell active="clubs">
      <BackLink label={t('edit_selection')} onClick={() => navigate(clubPath)} />

      <SectionHeader eyebrow={t('review_eyebrow')} title={t('review_title')} sub={t('review_sub')} />

      {loading && <Spinner />}

      {!loading && (
        <>
          {problem && (
            <Card className={styles.problem} data-blocking={check?.bookable ? undefined : 'true'}>
              <Icon name="info" />
              <div>
                <b>{t(PROBLEM_TITLE[problem])}</b>
                <p>{t(PROBLEM_DESC[problem])}</p>
              </div>
              {!check?.bookable && (
                <Button variant="primary" onClick={() => navigate(clubPath)}>
                  {t('pick_another_time')}
                </Button>
              )}
            </Card>
          )}

          <Card className={styles.card}>
            <h2 className={styles.clubName}>{club?.name ?? t('tennis_club')}</h2>
            {(club?.address || club?.city) && (
              <p className={styles.address}>{[club?.address, club?.city].filter(Boolean).join(', ')}</p>
            )}

            {court && (
              <ChipRow>
                <Chip variant="ghost" icon="court">{court.name}</Chip>
                <SurfaceBadge surface={court.surface_type} />
                <Chip variant={court.is_indoor ? 'indoor' : 'ghost'} icon={court.is_indoor ? 'indoor' : 'sun'}>
                  {court.is_indoor ? t('indoor') : t('outdoor')}
                </Chip>
              </ChipRow>
            )}

            <dl className={styles.rows}>
              <div>
                <dt>{t('review_when')}</dt>
                <dd>
                  {fmt.dateLong(`${intent.date}T00:00:00`, lang)} · {fmt.time(intent.start)} – {fmt.time(intent.end)}
                </dd>
              </div>
              <div>
                <dt>{t('review_duration')}</dt>
                <dd>{intent.minutes} {t('minutes_short')}</dd>
              </div>
              <div>
                <dt>{t('payment_method')}</dt>
                <dd>{t('pay_at_club')}<small>{t('pay_at_club_note')}</small></dd>
              </div>
              <div>
                <dt>{t('cancellation_policy')}</dt>
                {/* Club-specific policies are a §9 backend dependency; until the
                    API carries one, the platform default is what applies. */}
                <dd>{t('cancellation_default')}<small>{t('cancellation_default_note')}</small></dd>
              </div>
            </dl>

            <div className={styles.total}>
              <span>{t('review_total')}</span>
              <b>{fmt.money(price)}</b>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => navigate(clubPath)}>
                {t('edit_selection')}
              </Button>
              <Button
                variant="primary"
                icon={authed ? 'check' : 'user'}
                disabled={pending || !check?.bookable}
                onClick={onContinue}
              >
                {pending ? t('booking') : authed ? t('book') : t('continue_cta')}
              </Button>
            </div>

            {!authed && <p className={styles.note}>{t('review_auth_note')}</p>}
          </Card>
        </>
      )}
    </AppShell>
  );
}
