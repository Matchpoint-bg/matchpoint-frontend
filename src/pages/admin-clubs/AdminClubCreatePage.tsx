import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminShell } from '../../app/layout/AdminShell';
import { useAdminData } from '../../features/admin';
import type { NewClubCourt } from '../../features/admin';
import type { OpeningHour } from '../../features/clubs';
import { API_WEEKDAYS, useI18n } from '../../i18n';
import { Icon } from '../../shared/ui/Icon';
import styles from './AdminPages.module.css';

const EMPTY_FORM = {
  name: '', city: 'Sofia', address: '', description: '', phone: '', email: '', website: '',
  cancellationPolicy: '', managerName: '', managerPhone: '', managerEmail: '',
};

interface DraftCourt {
  key: number;
  name: string;
  sport: string;
  surface: string;
  indoor: boolean;
  lit: boolean;
  pricePerHour: number;
}

interface DraftHour {
  enabled: boolean;
  opening: string;
  closing: string;
}

interface GalleryImage {
  key: number;
  preview: string;
  name: string;
  type: string;
  size: number;
}

const INITIAL_COURTS: DraftCourt[] = [
  { key: 1, name: 'Court 1', sport: 'Tennis', surface: 'Hard', indoor: false, lit: true, pricePerHour: 30 },
];

const INITIAL_HOURS: Record<string, DraftHour> = Object.fromEntries(
  API_WEEKDAYS.map((day, index) => [day, {
    enabled: true,
    opening: index < 5 ? '08:00' : '09:00',
    closing: index < 5 ? '22:00' : '21:00',
  }]),
);

const FACILITIES = ['Parking', 'Changing rooms', 'Showers', 'Equipment rental'] as const;

export function AdminClubCreatePage() {
  const { t, weekdays } = useI18n();
  const { createClub } = useAdminData();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [courts, setCourts] = useState<DraftCourt[]>(INITIAL_COURTS);
  const [hours, setHours] = useState<Record<string, DraftHour>>(INITIAL_HOURS);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [cover, setCover] = useState<{ preview: string; name: string; type: string; size: number } | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const updateCourt = (key: number, patch: Partial<DraftCourt>) =>
    setCourts((current) => current.map((court) => court.key === key ? { ...court, ...patch } : court));

  const addCourt = () => {
    const key = Math.max(0, ...courts.map((court) => court.key)) + 1;
    setCourts((current) => [...current, { ...INITIAL_COURTS[0]!, key, name: `Court ${key}` }]);
  };

  const selectCover = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCover({ preview: String(reader.result), name: file.name, type: file.type, size: file.size });
    reader.readAsDataURL(file);
  };

  const selectGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const images = await Promise.all(files.map((file, index) => readGalleryImage(file, Date.now() + index)));
    setGallery((current) => [...current, ...images].slice(0, 8));
    event.target.value = '';
  };

  const toggleFacility = (facility: string) =>
    setFacilities((current) => current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const activeHours = API_WEEKDAYS.flatMap((weekday): OpeningHour[] => {
      const row = hours[weekday];
      return row?.enabled ? [{ weekday, opening_hour: row.opening, closing_hour: row.closing }] : [];
    });
    const requiredMissing = [form.name, form.address, form.managerName, form.managerPhone, form.managerEmail].some((value) => !value.trim());
    const invalidCourts = courts.length === 0 || courts.some((court) => !court.name.trim() || !court.sport.trim() || court.pricePerHour <= 0);
    const invalidHours = activeHours.length === 0 || activeHours.some((row) => row.opening_hour >= row.closing_hour);
    if (requiredMissing || invalidCourts || invalidHours) {
      setShowErrors(true);
      return;
    }

    const opening = activeHours.map((row) => row.opening_hour).sort()[0] ?? '08:00';
    const closing = activeHours.map((row) => row.closing_hour).sort().at(-1) ?? '22:00';
    const newCourts: NewClubCourt[] = courts.map((court) => ({
      court: {
        name: court.name.trim(), sport_type: court.sport.trim(), surface_type: court.surface,
        is_indoor: court.indoor, is_lit: court.lit, is_active: true,
      },
      pricePerHour: court.pricePerHour,
    }));
    const manager = { name: form.managerName.trim(), phone: form.managerPhone.trim(), email: form.managerEmail.trim() };
    const club = {
      name: form.name.trim(), city: form.city.trim(), address: form.address.trim(),
      description: form.description.trim(), phone: form.phone.trim(), email: form.email.trim(),
      website: form.website.trim(), cancellation_policy: form.cancellationPolicy.trim(),
      facilities, payment_methods: ['pay_on_site'], status: 'Draft' as const,
      ...(cover ? { thumbnail_url: cover.preview } : {}),
      ...(gallery.length ? { gallery_urls: gallery.map((image) => image.preview) } : {}),
    };
    const payload = {
      club: { ...club, thumbnail_url: undefined, gallery_urls: undefined },
      manager,
      courts: newCourts.map(({ court, pricePerHour }) => ({
        ...court,
        prices: [{ weekday: 'All', time_start: opening, time_end: closing, price_per_30_minutes: pricePerHour / 2 }],
      })),
      opening_hours: activeHours,
      cover_image: cover ? { name: cover.name, type: cover.type, size: cover.size } : null,
      gallery_images: gallery.map(({ name, type, size }) => ({ name, type, size })),
    };

    window.alert(`${t('admin_payload_alert')}\n\n${JSON.stringify(payload, null, 2)}`);
    const id = createClub({ club, manager, courts: newCourts, openingHours: activeHours });
    navigate(`/admin/clubs/${id}`, { replace: true });
  };

  const invalid = (key: keyof typeof form) => showErrors && !form[key].trim();

  return (
    <AdminShell title={t('admin_create_club')}>
      <Link className={styles.back} to="/admin/clubs"><Icon name="back" />{t('admin_back_clubs')}</Link>
      <form className={styles.createLayout} onSubmit={submit} noValidate>
        <div className={styles.createMain}>
          <section className={styles.pageHead}>
            <div><p className="eyebrow">{t('admin_status_draft')}</p><h2>{t('admin_new_club_title')}</h2><p>{t('admin_complete_create_desc')}</p></div>
          </section>

          <CreateCard icon="info" title={t('admin_information')} desc={t('admin_information_desc')}>
            <div className={styles.formGrid}>
              <Field id="new-club-name" label={`${t('label_name')} *`} value={form.name} onChange={set('name')} invalid={invalid('name')} />
              <Field id="new-club-city" label={t('city')} value={form.city} onChange={set('city')} />
              <Field full id="new-club-address" label={`${t('label_address')} *`} value={form.address} onChange={set('address')} invalid={invalid('address')} />
              <div className={`field ${styles.full}`}><label htmlFor="new-club-description">{t('label_description')}</label><textarea id="new-club-description" rows={3} value={form.description} onChange={set('description')} /></div>
              <Field id="new-club-phone" type="tel" label={t('phone')} value={form.phone} onChange={set('phone')} />
              <Field id="new-club-email" type="email" label={t('email')} value={form.email} onChange={set('email')} />
              <Field full id="new-club-website" type="url" label={t('club_website')} value={form.website} onChange={set('website')} />
            </div>
          </CreateCard>

          <CreateCard icon="info" title={t('admin_images')} desc={t('admin_create_images_desc')}>
            <div className={styles.imageSection}>
              <div className={styles.coverColumn}>
                <label className={styles.uploadArea} htmlFor="create-cover">
                  {cover ? <img src={cover.preview} alt={t('admin_cover_preview')} /> : <span><Icon name="plus" /><strong>{t('admin_choose_image')}</strong><small>{t('admin_image_hint')}</small></span>}
                </label>
                <input className={styles.fileInput} id="create-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectCover} />
                <div className={styles.uploadActions}>
                  <label className="btn btn--outline btn--sm" htmlFor="create-cover">{cover ? t('admin_replace_image') : t('admin_browse_files')}</label>
                  {cover && <button className="btn btn--soft btn--sm" type="button" onClick={() => setCover(null)}>{t('remove')}</button>}
                </div>
              </div>
              <div className={styles.imageGuidance}>
                <h4>{t('admin_cover_image')}</h4>
                <p>{t('admin_cover_image_desc')}</p>
                <ul><li>{t('admin_image_landscape')}</li><li>{t('admin_image_formats')}</li><li>{t('admin_image_not_uploaded')}</li></ul>
              </div>
            </div>
            <div className={styles.gallerySection}>
              <div className={styles.galleryHead}>
                <div><h4>{t('admin_gallery')}</h4><p>{t('admin_gallery_desc')}</p></div>
                <label className="btn btn--outline btn--sm" htmlFor="create-gallery"><Icon name="plus" />{t('admin_add_gallery_images')}</label>
                <input className={styles.fileInput} id="create-gallery" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void selectGallery(event)} />
              </div>
              {gallery.length > 0 ? <div className={styles.galleryGrid}>{gallery.map((image) => <div className={styles.galleryItem} key={image.key}><img src={image.preview} alt="" /><button type="button" onClick={() => setGallery((current) => current.filter((item) => item.key !== image.key))} aria-label={`${t('remove')}: ${image.name}`}><Icon name="x" /></button><span title={image.name}>{image.name}</span></div>)}</div> : <div className={styles.galleryEmpty}><Icon name="info" /><span>{t('admin_gallery_empty')}</span></div>}
              <small className={styles.galleryNote}>{t('admin_gallery_limit')}</small>
            </div>
          </CreateCard>

          <CreateCard icon="info" title={t('admin_facilities_policy')} desc={t('admin_facilities_policy_desc')}>
            <fieldset className={styles.facilityFieldset}>
              <legend>{t('admin_facilities')}</legend>
              <div className={styles.facilityGrid}>
                {FACILITIES.map((facility) => {
                  const checked = facilities.includes(facility);
                  return <label className={`${styles.facilityOption}${checked ? ` ${styles.facilitySelected}` : ''}`} key={facility}><input type="checkbox" checked={checked} onChange={() => toggleFacility(facility)} /><span>{facilityLabel(facility, t)}</span>{checked && <Icon name="check" />}</label>;
                })}
              </div>
            </fieldset>
            <div className={`field ${styles.policyField}`}><label htmlFor="cancellation-policy">{t('cancellation_policy')}</label><textarea id="cancellation-policy" rows={3} value={form.cancellationPolicy} onChange={set('cancellationPolicy')} placeholder={t('cancellation_policy_default')} /><small>{t('admin_policy_hint')}</small></div>
          </CreateCard>

          <CreateCard icon="court" title={t('admin_courts')} desc={t('admin_create_courts_desc')}>
            <div className={styles.createCourts}>
              {courts.map((court, index) => (
                <div className={styles.createCourt} key={court.key}>
                  <div className={styles.createCourtHead}><strong>{t('admin_court')} {index + 1}</strong><button className="btn btn--danger btn--sm" type="button" onClick={() => setCourts((current) => current.filter((item) => item.key !== court.key))}><Icon name="trash" />{t('remove')}</button></div>
                  <div className={styles.courtFormGrid}>
                    <Field id={`court-name-${court.key}`} label={`${t('admin_court_name')} *`} value={court.name} onChange={(event) => updateCourt(court.key, { name: event.target.value })} invalid={showErrors && !court.name.trim()} />
                    <Field id={`court-sport-${court.key}`} label={`${t('sport')} *`} value={court.sport} onChange={(event) => updateCourt(court.key, { sport: event.target.value })} />
                    <div className="field"><label htmlFor={`court-surface-${court.key}`}>{t('surface')}</label><select id={`court-surface-${court.key}`} value={court.surface} onChange={(event) => updateCourt(court.key, { surface: event.target.value })}><option>Hard</option><option>Clay</option><option>Grass</option></select></div>
                    <div className="field"><label htmlFor={`court-price-${court.key}`}>{t('admin_price_hour')}</label><div className={styles.priceInput}><input id={`court-price-${court.key}`} type="number" min="1" step="1" value={court.pricePerHour} onChange={(event) => updateCourt(court.key, { pricePerHour: Number(event.target.value) })} /><span>BGN</span></div></div>
                  </div>
                  <div className={styles.optionGrid}><label className={styles.check}><input type="checkbox" checked={court.indoor} onChange={(event) => updateCourt(court.key, { indoor: event.target.checked })} />{t('indoor')}</label><label className={styles.check}><input type="checkbox" checked={court.lit} onChange={(event) => updateCourt(court.key, { lit: event.target.checked })} />{t('floodlit')}</label></div>
                </div>
              ))}
            </div>
            <button className="btn btn--outline btn--sm" type="button" onClick={addCourt}><Icon name="plus" />{t('admin_add_another_court')}</button>
          </CreateCard>

          <CreateCard icon="clock" title={t('hours_card')} desc={t('admin_hours_desc')}>
            <div className={styles.hours}>
              {API_WEEKDAYS.map((day, index) => {
                const row = hours[day]!;
                return <div className={styles.hourRow} key={day}><label className={styles.check}><input type="checkbox" checked={row.enabled} onChange={(event) => setHours((current) => ({ ...current, [day]: { ...row, enabled: event.target.checked } }))} />{weekdays[index]}</label>{row.enabled ? <><input aria-label={`${weekdays[index]} ${t('opens')}`} type="time" value={row.opening} onChange={(event) => setHours((current) => ({ ...current, [day]: { ...row, opening: event.target.value } }))} /><span>—</span><input aria-label={`${weekdays[index]} ${t('closes')}`} type="time" value={row.closing} onChange={(event) => setHours((current) => ({ ...current, [day]: { ...row, closing: event.target.value } }))} /></> : <span className={styles.closed}>{t('closed')}</span>}</div>;
              })}
            </div>
          </CreateCard>

          <CreateCard icon="user" title={t('admin_manager')} desc={t('admin_manager_form_desc')}>
            <div className={styles.formGrid}>
              <Field full id="manager-name" label={`${t('admin_manager_name')} *`} value={form.managerName} onChange={set('managerName')} invalid={invalid('managerName')} />
              <Field id="manager-phone" type="tel" label={`${t('phone')} *`} value={form.managerPhone} onChange={set('managerPhone')} invalid={invalid('managerPhone')} />
              <Field id="manager-email" type="email" label={`${t('email')} *`} value={form.managerEmail} onChange={set('managerEmail')} invalid={invalid('managerEmail')} />
            </div>
          </CreateCard>

          {showErrors && <p className={styles.formError} role="alert">{t('admin_complete_required')}</p>}
        </div>

        <aside className={`card card--pad ${styles.createSummary}`}>
          <h3>{t('admin_before_create')}</h3><p>{t('admin_full_payload_desc')}</p>
          <ul><li><Icon name="check" />{t('admin_created_as_draft')}</li><li><Icon name="check" />{t('admin_no_backend_request')}</li><li><Icon name="check" />{t('admin_payload_in_alert')}</li></ul>
          <button className="btn btn--primary btn--block" type="submit"><Icon name="plus" />{t('admin_create_club')}</button>
          <Link className="btn btn--soft btn--block" to="/admin/clubs">{t('cancel')}</Link>
        </aside>
      </form>
    </AdminShell>
  );
}

function CreateCard({ icon, title, desc, children }: { icon: 'info' | 'user' | 'court' | 'clock'; title: string; desc: string; children: ReactNode }) {
  return <section className={`card card--pad ${styles.createCard}`}><header className={styles.simpleHeader}><span className={styles.sectionIcon}><Icon name={icon} /></span><div><h3>{title}</h3><p>{desc}</p></div></header>{children}</section>;
}

function Field({ id, label, value, onChange, type = 'text', invalid = false, full = false }: { id: string; label: string; value: string; onChange: (event: { target: { value: string } }) => void; type?: string; invalid?: boolean; full?: boolean }) {
  return <div className={`field${full ? ` ${styles.full}` : ''}`}><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={onChange} aria-invalid={invalid} /></div>;
}

function facilityLabel(facility: (typeof FACILITIES)[number], t: ReturnType<typeof useI18n>['t']) {
  const keys = { Parking: 'admin_facility_parking', 'Changing rooms': 'admin_facility_changing', Showers: 'admin_facility_showers', 'Equipment rental': 'admin_facility_rental' } as const;
  return t(keys[facility]);
}

function readGalleryImage(file: File, key: number): Promise<GalleryImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ key, preview: String(reader.result), name: file.name, type: file.type, size: file.size });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
