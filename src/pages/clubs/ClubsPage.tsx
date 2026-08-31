import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../app/layout/AppShell';
import { InstallBanner } from '../../features/install';
import { PlayerSearchForm, searchCriteriaParams, usePlayerSearch } from '../../features/search';
import { useI18n } from '../../i18n';
import { Icon } from '../../shared/ui/Icon';
import styles from './ClubsPage.module.css';

export function ClubsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = usePlayerSearch();

  const submitSearch = () => {
    if (!search.submit()) return;
    const params = searchCriteriaParams({
      city: search.draft.city,
      sport: search.draft.sport,
      date: search.draft.date,
      ...(search.draft.surface ? { surface: search.draft.surface } : {}),
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <AppShell active="clubs">
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><span />{t('search_hero_eyebrow')}</span>
          <h1>{t('search_hero_title')}</h1>
          <p>{t('search_hero_desc')}</p>
          <div className={styles.proof} aria-label={t('search_why_matchpoint')}>
            <span><Icon name="check" />{t('search_proof_compare')}</span>
            <span><Icon name="check" />{t('search_proof_no_login')}</span>
          </div>
        </div>
        <PlayerSearchForm
          draft={search.draft}
          errors={search.formErrors}
          invalidUrl={false}
          onFieldChange={search.setField}
          onSubmit={submitSearch}
        />
      </section>
      <div className={styles.install}><InstallBanner /></div>
    </AppShell>
  );
}
