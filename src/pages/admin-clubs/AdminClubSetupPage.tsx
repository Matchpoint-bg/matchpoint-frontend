import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminShell } from '../../app/layout/AdminShell';
import { setupChecks, useAdminData } from '../../features/admin';
import type { ClubSetup } from '../../features/admin';
import type { OpeningHour } from '../../features/clubs';
import type { Price } from '../../features/courts';
import { API_WEEKDAYS, useI18n } from '../../i18n';
import { Icon } from '../../shared/ui/Icon';
import { useToast } from '../../shared/ui/Toast';
import styles from './AdminPages.module.css';

const FACILITIES = ['Parking', 'Changing rooms', 'Showers', 'Equipment rental'] as const;

export function AdminClubSetupPage() {
  const { t } = useI18n();
  const { id } = useParams();
  const { clubs, updateClub } = useAdminData();
  const { toast } = useToast();
  const setup = clubs.find((item) => item.club.id === Number(id));

  if (!setup) {
    return <AdminShell title={t('admin_club_setup')}><div className={`card card--pad ${styles.empty}`}><Icon name="info" /><h2>{t('club_missing_title')}</h2><Link className="btn btn--primary" to="/admin/clubs">{t('admin_back_clubs')}</Link></div></AdminShell>;
  }

  const checks = setupChecks(setup);
  const complete = checks.filter((check) => check.complete).length;
  const canActivate = checks.every((check) => check.complete);
  const setStatus = (status: 'Active' | 'Inactive') => {
    if (!window.confirm(status === 'Active' ? t('admin_confirm_activate') : t('admin_confirm_deactivate'))) return;
    updateClub(setup.club.id, { status });
    toast(status === 'Active' ? t('admin_activated') : t('admin_deactivated'), 'ok');
  };

  return (
    <AdminShell title={setup.club.name || t('admin_club_setup')}>
      <Link className={styles.back} to="/admin/clubs"><Icon name="back" />{t('admin_back_clubs')}</Link>
      <section className={styles.setupHead}>
        <div>
          <div className={styles.titleLine}><h2>{setup.club.name || t('admin_untitled_club')}</h2><span className={`${styles.status} ${styles[`status${setup.club.status ?? 'Draft'}`]}`}>{statusLabel(setup.club.status, t)}</span></div>
          <p>{t('admin_setup_desc')}</p>
        </div>
      </section>

      <div className={styles.setupLayout}>
        <div className={styles.sections}>
          <InformationSection setup={setup} />
          <ImagesSection setup={setup} />
          <FacilitiesSection setup={setup} />
          <CourtsSection setup={setup} />
          <HoursSection setup={setup} />
          <PricingSection setup={setup} />
          <ManagerSection setup={setup} />
          <ReviewSection setup={setup} />
        </div>

        <aside className={`card card--pad ${styles.checklist}`}>
          <div className={styles.checkHead}><strong>{t('admin_setup_progress')}</strong><span>{complete}/{checks.length}</span></div>
          <div className={styles.progress}><span style={{ width: `${complete / checks.length * 100}%` }} /></div>
          <nav aria-label={t('admin_setup_progress')}>
            {checks.map((check) => <a key={check.key} href={`#${check.key}`} className={check.complete ? styles.done : ''}><Icon name={check.complete ? 'check' : 'clock'} />{checkLabel(check.key, t)}</a>)}
          </nav>
          {!canActivate && <p className="small-note">{t('admin_activation_hint')}</p>}
          {setup.club.status !== 'Active' ? <button className="btn btn--primary btn--block" type="button" disabled={!canActivate} onClick={() => setStatus('Active')}><Icon name="check" />{t('admin_activate')}</button> : <button className="btn btn--danger btn--block" type="button" onClick={() => setStatus('Inactive')}><Icon name="ban" />{t('admin_deactivate')}</button>}
        </aside>
      </div>
    </AdminShell>
  );
}

function Section({ id, title, desc, icon, children }: { id: string; title: string; desc: string; icon: 'info' | 'court' | 'clock' | 'tag' | 'user' | 'check'; children: ReactNode }) {
  return <section id={id} className={`card card--pad ${styles.section}`}><header><span className={styles.sectionIcon}><Icon name={icon} /></span><div><h3>{title}</h3><p>{desc}</p></div></header>{children}</section>;
}

function InformationSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const { updateClub } = useAdminData();
  const club = setup.club;
  const set = (field: 'name' | 'city' | 'address' | 'description' | 'phone' | 'email' | 'website') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateClub(club.id, { [field]: event.target.value });
  return (
    <Section id="information" title={t('admin_information')} desc={t('admin_information_desc')} icon="info">
      <div className={styles.formGrid}>
        <Field label={`${t('label_name')} *`} value={club.name} onChange={set('name')} />
        <Field label={t('city')} value={club.city ?? ''} onChange={set('city')} />
        <Field full label={`${t('label_address')} *`} value={club.address ?? ''} onChange={set('address')} />
        <div className={`field ${styles.full}`}><label>{t('label_description')}</label><textarea rows={3} value={club.description ?? ''} onChange={set('description')} /></div>
        <Field type="tel" label={t('phone')} value={club.phone ?? ''} onChange={set('phone')} />
        <Field type="email" label={t('email')} value={club.email ?? ''} onChange={set('email')} />
        <Field full type="url" label={t('club_website')} value={club.website ?? ''} onChange={set('website')} />
      </div>
    </Section>
  );
}

function ImagesSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const { updateClub } = useAdminData();
  const selectCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updateClub(setup.club.id, { thumbnail_url: await readImage(file) });
  };
  const selectGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const urls = await Promise.all(files.map(readImage));
    updateClub(setup.club.id, { gallery_urls: [...(setup.club.gallery_urls ?? []), ...urls].slice(0, 8) });
    event.target.value = '';
  };
  return (
    <Section id="images" title={t('admin_images')} desc={t('admin_create_images_desc')} icon="info">
      <div className={styles.imageSection}>
        <div className={styles.coverColumn}>
          <label className={styles.uploadArea} htmlFor="setup-cover">
            {setup.club.thumbnail_url ? <img src={setup.club.thumbnail_url} alt={t('admin_cover_preview')} /> : <span><Icon name="plus" /><strong>{t('admin_choose_image')}</strong><small>{t('admin_image_hint')}</small></span>}
          </label>
          <input className={styles.fileInput} id="setup-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void selectCover(event)} />
          <div className={styles.uploadActions}><label className="btn btn--outline btn--sm" htmlFor="setup-cover">{setup.club.thumbnail_url ? t('admin_replace_image') : t('admin_browse_files')}</label>{setup.club.thumbnail_url && <button className="btn btn--soft btn--sm" type="button" onClick={() => updateClub(setup.club.id, { thumbnail_url: undefined })}>{t('remove')}</button>}</div>
        </div>
        <div className={styles.imageGuidance}><h4>{t('admin_cover_image')}</h4><p>{t('admin_cover_image_desc')}</p><ul><li>{t('admin_image_landscape')}</li><li>{t('admin_image_formats')}</li><li>{t('admin_image_not_uploaded')}</li></ul></div>
      </div>
      <div className={styles.gallerySection}>
        <div className={styles.galleryHead}><div><h4>{t('admin_gallery')}</h4><p>{t('admin_gallery_desc')}</p></div><label className="btn btn--outline btn--sm" htmlFor="setup-gallery"><Icon name="plus" />{t('admin_add_gallery_images')}</label><input className={styles.fileInput} id="setup-gallery" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void selectGallery(event)} /></div>
        {(setup.club.gallery_urls?.length ?? 0) > 0 ? <div className={styles.galleryGrid}>{setup.club.gallery_urls?.map((url, index) => <div className={styles.galleryItem} key={`${url.slice(0, 30)}-${index}`}><img src={url} alt="" /><button type="button" onClick={() => updateClub(setup.club.id, { gallery_urls: setup.club.gallery_urls?.filter((_, itemIndex) => itemIndex !== index) })} aria-label={t('remove')}><Icon name="x" /></button><span>{t('admin_gallery_photo')} {index + 1}</span></div>)}</div> : <div className={styles.galleryEmpty}><Icon name="info" /><span>{t('admin_gallery_empty')}</span></div>}
        <small className={styles.galleryNote}>{t('admin_gallery_limit')}</small>
      </div>
    </Section>
  );
}

function FacilitiesSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const { updateClub } = useAdminData();
  const selected = setup.club.facilities ?? [];
  const toggle = (facility: string) => updateClub(setup.club.id, { facilities: selected.includes(facility) ? selected.filter((item) => item !== facility) : [...selected, facility] });
  return (
    <Section id="facilities" title={t('admin_facilities_policy')} desc={t('admin_facilities_policy_desc')} icon="info">
      <fieldset className={styles.facilityFieldset}><legend>{t('admin_facilities')}</legend><div className={styles.facilityGrid}>{FACILITIES.map((facility) => { const checked = selected.includes(facility); return <label className={`${styles.facilityOption}${checked ? ` ${styles.facilitySelected}` : ''}`} key={facility}><input type="checkbox" checked={checked} onChange={() => toggle(facility)} /><span>{facilityLabel(facility, t)}</span>{checked && <Icon name="check" />}</label>; })}</div></fieldset>
      <div className={`field ${styles.policyField}`}><label>{t('cancellation_policy')}</label><textarea rows={3} value={setup.club.cancellation_policy ?? ''} onChange={(event) => updateClub(setup.club.id, { cancellation_policy: event.target.value })} placeholder={t('cancellation_policy_default')} /><small>{t('admin_policy_hint')}</small></div>
    </Section>
  );
}

function CourtsSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const { addCourt, updateCourt, deleteCourt, setPrices } = useAdminData();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', sport: 'Tennis', surface: 'Hard', price: 30 });
  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim() || draft.price <= 0) return;
    const courtId = addCourt(setup.club.id, { name: draft.name.trim(), sport_type: draft.sport, surface_type: draft.surface, is_indoor: false, is_lit: true, is_active: true });
    setPrices(setup.club.id, courtId, [{ weekday: 'All', time_start: '08:00', time_end: '22:00', price_per_30_minutes: draft.price / 2 }]);
    setDraft({ name: '', sport: 'Tennis', surface: 'Hard', price: 30 });
    setAdding(false);
  };
  return (
    <Section id="courts" title={t('admin_courts')} desc={t('admin_courts_desc')} icon="court">
      <div className={styles.createCourts}>
        {setup.courts.map((court, index) => <div className={styles.createCourt} key={court.id}>
          <div className={styles.createCourtHead}><div><strong>{t('admin_court')} {index + 1}</strong><span className={`${styles.miniStatus} ${court.is_active !== false ? styles.miniActive : ''}`}>{court.is_active !== false ? t('admin_status_active') : t('admin_status_inactive')}</span></div><button className="btn btn--danger btn--sm" type="button" onClick={() => window.confirm(t('admin_confirm_delete_court')) && deleteCourt(setup.club.id, court.id)}><Icon name="trash" />{t('remove')}</button></div>
          <div className={styles.courtFormGrid}><Field label={t('label_name')} value={court.name} onChange={(event) => updateCourt(setup.club.id, court.id, { name: event.target.value })} /><Field label={t('sport')} value={court.sport_type} onChange={(event) => updateCourt(setup.club.id, court.id, { sport_type: event.target.value })} /><div className="field"><label>{t('surface')}</label><select value={court.surface_type} onChange={(event) => updateCourt(setup.club.id, court.id, { surface_type: event.target.value })}><option>Hard</option><option>Clay</option><option>Grass</option></select></div></div>
          <div className={styles.optionGrid}><label className={styles.check}><input type="checkbox" checked={court.is_indoor} onChange={(event) => updateCourt(setup.club.id, court.id, { is_indoor: event.target.checked })} />{t('indoor')}</label><label className={styles.check}><input type="checkbox" checked={court.is_lit} onChange={(event) => updateCourt(setup.club.id, court.id, { is_lit: event.target.checked })} />{t('floodlit')}</label><label className={styles.check}><input type="checkbox" checked={court.is_active !== false} onChange={(event) => updateCourt(setup.club.id, court.id, { is_active: event.target.checked })} />{t('admin_status_active')}</label></div>
        </div>)}
      </div>
      {adding ? <form className={styles.newCourtPanel} onSubmit={add}><h4>{t('new_court')}</h4><div className={styles.courtFormGrid}><Field label={`${t('admin_court_name')} *`} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /><Field label={t('sport')} value={draft.sport} onChange={(event) => setDraft((current) => ({ ...current, sport: event.target.value }))} /><div className="field"><label>{t('surface')}</label><select value={draft.surface} onChange={(event) => setDraft((current) => ({ ...current, surface: event.target.value }))}><option>Hard</option><option>Clay</option><option>Grass</option></select></div><div className="field"><label>{t('admin_price_hour')}</label><input type="number" min="1" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} /></div></div><div className={styles.inlineActions}><button className="btn btn--primary btn--sm" type="submit">{t('add')}</button><button className="btn btn--soft btn--sm" type="button" onClick={() => setAdding(false)}>{t('cancel')}</button></div></form> : <button className="btn btn--outline btn--sm" type="button" onClick={() => setAdding(true)}><Icon name="plus" />{t('new_court')}</button>}
    </Section>
  );
}

function HoursSection({ setup }: { setup: ClubSetup }) {
  const { t, weekdays } = useI18n();
  const { setOpeningHours } = useAdminData();
  const change = (weekday: string, patch: Partial<OpeningHour>, enabled?: boolean) => {
    const current = setup.openingHours.find((row) => row.weekday === weekday);
    if (enabled === false) { setOpeningHours(setup.club.id, setup.openingHours.filter((row) => row.weekday !== weekday)); return; }
    setOpeningHours(setup.club.id, current ? setup.openingHours.map((row) => row.weekday === weekday ? { ...row, ...patch } : row) : [...setup.openingHours, { weekday, opening_hour: '08:00', closing_hour: '22:00', ...patch }]);
  };
  return <Section id="hours" title={t('hours_card')} desc={t('admin_hours_desc')} icon="clock"><div className={styles.hours}>{API_WEEKDAYS.map((day, index) => { const row = setup.openingHours.find((item) => item.weekday === day); return <div className={styles.hourRow} key={day}><label className={styles.check}><input type="checkbox" checked={Boolean(row)} onChange={(event) => change(day, {}, event.target.checked)} />{weekdays[index]}</label>{row ? <><input aria-label={`${weekdays[index]} ${t('opens')}`} type="time" value={row.opening_hour.slice(0, 5)} onChange={(event) => change(day, { opening_hour: event.target.value })} /><span>—</span><input aria-label={`${weekdays[index]} ${t('closes')}`} type="time" value={row.closing_hour.slice(0, 5)} onChange={(event) => change(day, { closing_hour: event.target.value })} /></> : <span className={styles.closed}>{t('closed')}</span>}</div>; })}</div></Section>;
}

function PricingSection({ setup }: { setup: ClubSetup }) {
  const { t, weekdays } = useI18n();
  const { setPrices } = useAdminData();
  const defaultPrice: Price = { weekday: 'All', time_start: '08:00', time_end: '22:00', price_per_30_minutes: 15 };
  const update = (courtId: number, index: number, patch: Partial<Price>) => setPrices(setup.club.id, courtId, (setup.pricesByCourt[courtId] ?? []).map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return (
    <Section id="prices" title={t('prices')} desc={t('admin_prices_desc')} icon="tag">
      <div className={styles.priceCourts}>{setup.courts.filter((court) => court.is_active !== false).map((court) => { const rows = setup.pricesByCourt[court.id] ?? []; return <div className={styles.priceCourt} key={court.id}><h4>{court.name}</h4>{rows.map((row, index) => <div className={styles.priceRow} key={index}><select aria-label={t('weekday')} value={row.weekday} onChange={(event) => update(court.id, index, { weekday: event.target.value })}><option value="All">{t('admin_every_day')}</option>{API_WEEKDAYS.map((day, dayIndex) => <option key={day} value={day}>{weekdays[dayIndex]}</option>)}</select><input aria-label={t('from')} type="time" value={row.time_start.slice(0, 5)} onChange={(event) => update(court.id, index, { time_start: event.target.value })} /><input aria-label={t('to')} type="time" value={row.time_end.slice(0, 5)} onChange={(event) => update(court.id, index, { time_end: event.target.value })} /><label><input aria-label={t('price30')} type="number" min="0.5" step="0.5" value={row.price_per_30_minutes} onChange={(event) => update(court.id, index, { price_per_30_minutes: Number(event.target.value) })} /><span>BGN / 30 min</span></label><button className="btn btn--danger btn--sm" type="button" aria-label={t('remove')} onClick={() => setPrices(setup.club.id, court.id, rows.filter((_, rowIndex) => rowIndex !== index))}><Icon name="trash" /></button></div>)}<button className="btn btn--outline btn--sm" type="button" onClick={() => setPrices(setup.club.id, court.id, [...rows, defaultPrice])}><Icon name="plus" />{t('add_price_band')}</button></div>; })}</div>
      {setup.courts.filter((court) => court.is_active !== false).length === 0 && <p className="small-note">{t('admin_add_court_first')}</p>}
    </Section>
  );
}

function ManagerSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const { updateManager } = useAdminData();
  return <Section id="manager" title={t('admin_manager')} desc={t('admin_manager_form_desc')} icon="user"><div className={styles.formGrid}><Field full label={`${t('admin_manager_name')} *`} value={setup.manager.name} onChange={(event) => updateManager(setup.club.id, { name: event.target.value })} /><Field type="tel" label={`${t('phone')} *`} value={setup.manager.phone} onChange={(event) => updateManager(setup.club.id, { phone: event.target.value })} /><Field type="email" label={`${t('email')} *`} value={setup.manager.email} onChange={(event) => updateManager(setup.club.id, { email: event.target.value })} /></div></Section>;
}

function ReviewSection({ setup }: { setup: ClubSetup }) {
  const { t } = useI18n();
  const checks = setupChecks(setup);
  return <Section id="review" title={t('admin_review')} desc={t('admin_review_desc')} icon="check"><div className={styles.reviewGrid}>{checks.map((check) => <div key={check.key} className={check.complete ? styles.reviewDone : styles.reviewMissing}><Icon name={check.complete ? 'check' : 'x'} /><span><strong>{checkLabel(check.key, t)}</strong><small>{check.complete ? t('admin_ready') : t('admin_needs_attention')}</small></span></div>)}</div></Section>;
}

function Field({ label, value, onChange, type = 'text', full = false }: { label: string; value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; type?: string; full?: boolean }) {
  return <div className={`field${full ? ` ${styles.full}` : ''}`}><label>{label}</label><input type={type} value={value} onChange={onChange} /></div>;
}

function checkLabel(key: ReturnType<typeof setupChecks>[number]['key'], t: ReturnType<typeof useI18n>['t']) {
  const keys = { information: 'admin_information', courts: 'admin_courts', hours: 'hours_card', prices: 'prices', manager: 'admin_manager' } as const;
  return t(keys[key]);
}

function statusLabel(status: ClubSetup['club']['status'], t: ReturnType<typeof useI18n>['t']) {
  if (status === 'Active') return t('admin_status_active');
  if (status === 'Inactive') return t('admin_status_inactive');
  return t('admin_status_draft');
}

function facilityLabel(facility: (typeof FACILITIES)[number], t: ReturnType<typeof useI18n>['t']) {
  const keys = { Parking: 'admin_facility_parking', 'Changing rooms': 'admin_facility_changing', Showers: 'admin_facility_showers', 'Equipment rental': 'admin_facility_rental' } as const;
  return t(keys[facility]);
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
