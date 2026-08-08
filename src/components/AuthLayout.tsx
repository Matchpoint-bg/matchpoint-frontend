import type { ReactNode } from 'react';
import { Seam } from './Icons';
import { ThemeLangToggles } from './Shell';
import { useI18n } from '../i18n';

/**
 * The split brand/form screen shared by every signed-out page (sign in, forgot password,
 * reset password). Extracted from AuthPage so the recovery flows don't duplicate the panel.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="auth-wrap">
      <div className="auth-brandside">
        <Seam />
        <div className="hero__glow" />

        <div className="b-top">
          <img className="b-mark" src="/icons/icon-192.png" alt="" width={40} height={40} />
          <span className="brand__tag" style={{ color: 'var(--leaf)' }}>
            {t('tap_hero')}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <ThemeLangToggles />
          </span>
        </div>

        <div>
          <h1>
            {t('hero_title1')}
            <br />
            <span>{t('hero_title2')}</span>
          </h1>
          <p className="lede">{t('hero_lede')}</p>
          <div className="pills">
            <span className="pill">{t('pill_live')}</span>
            <span className="pill">{t('pill_instant')}</span>
            <span className="pill">{t('pill_surfaces')}</span>
            <span className="pill">{t('pill_install')}</span>
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12.5 }}>{t('powered_by')}</div>
      </div>

      <div className="auth-formside">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
