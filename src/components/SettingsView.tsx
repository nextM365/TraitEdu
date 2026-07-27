import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsViewProps {
  appearance: 'light' | 'dark' | 'system';
  theme: 'purple' | 'teal' | 'orange' | 'blue';
  language: 'en' | 'te' | 'kn' | 'hi';
  onAppearanceChange: (newAppearance: 'light' | 'dark' | 'system') => void;
  onThemeChange: (newTheme: 'purple' | 'teal' | 'orange' | 'blue') => void;
  onLanguageChange: (lang: 'en' | 'te' | 'kn' | 'hi') => void;
}

const settingsOptions = [
  { key: 'changeLanguage', icon: '🈶' },
  { key: 'notifications', icon: '🔔' },
  { key: 'address', icon: '📍' },
  { key: 'privacy', icon: '🔒' },
  { key: 'help', icon: '❓' },
  { key: 'logoutOne', icon: '🚪' },
  { key: 'logoutAll', icon: '🚪' },
  { key: 'legal', icon: 'ℹ️' },
];

export default function SettingsView({ appearance, theme, language, onAppearanceChange, onThemeChange, onLanguageChange }: SettingsViewProps) {
  const themeOptions = ['purple', 'teal', 'orange', 'blue'] as const;
  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu' },
    { code: 'kn', label: 'Kannada' },
    { code: 'hi', label: 'Hindi' },
  ] as const;
  const { t } = useTranslation();
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  return (
    <div className="settings-page module-card">
      <div className="settings-header">
        <div>
          <p className="settings-label">{t('settings.title')}</p>
          <h2>{t('settings.headline')}</h2>
          <p className="settings-subtitle">{t('settings.subtitle')}</p>
        </div>
      </div>

      <section className="settings-section">
        <div className="settings-section-title">{t('settings.appearance')}</div>
        <div className="settings-theme-list">
          {(['light', 'dark', 'system'] as const).map(option => (
            <label key={option} className="settings-theme-item">
              <input
                type="radio"
                name="appearance"
                value={option}
                checked={appearance === option}
                onChange={() => onAppearanceChange(option)}
              />
              <span className="theme-label">{t(`theme.${option === 'system' ? 'purple' : option}`) || (option.charAt(0).toUpperCase() + option.slice(1))}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Language chosen via inline dropdown below 'Change Language' item */}

      <section className="settings-section">
        <div className="settings-section-title">Theme Palette</div>
        <div className="settings-color-list">
          {themeOptions.map(option => (
            <button
              key={option}
              type="button"
              className={`settings-color-swatch ${option} ${theme === option ? 'active' : ''}`}
              onClick={() => onThemeChange(option)}>
              <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-list">
        {settingsOptions.map(item => {
          if (item.key === 'changeLanguage') {
            return (
              <div key={item.key}>
                <button
                  className="settings-list-item"
                  onClick={() => setShowLanguageOptions(prev => !prev)}>
                  <span className="settings-item-icon">{item.icon}</span>
                  <span>{t(`settings.options.${item.key}`)}</span>
                  <span className="settings-item-arrow">{showLanguageOptions ? '˅' : '›'}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontWeight: 700 }}>{t(`languageNames.${language}`)}</span>
                </button>

                {showLanguageOptions && (
                  <div className="settings-language-dropdown">
                    {languageOptions.map(opt => (
                      <button
                        key={opt.code}
                        className={`settings-language-option ${language === opt.code ? 'active' : ''}`}
                        onClick={() => {
                          onLanguageChange(opt.code as 'en' | 'te' | 'kn' | 'hi');
                          setShowLanguageOptions(false);
                        }}>
                        <span>{t(`languageNames.${opt.code}`)}</span>
                        {language === opt.code && <span style={{ marginLeft: 'auto' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button key={item.key} className="settings-list-item">
              <span className="settings-item-icon">{item.icon}</span>
              <span>{t(`settings.options.${item.key}`)}</span>
              <span className="settings-item-arrow">›</span>
            </button>
          );
        })}
      </section>

      <div className="settings-brand">
        <span className="settings-brand-badge">Trait School</span>
        <p>Stable, simple, and built for student success.</p>
      </div>
    </div>
  );
}
