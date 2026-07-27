import { useEffect, useState } from 'react';
import {
  fetchDashboard,
  fetchSchool,
  fetchStudents,
  fetchTeachers,
} from './services/api.ts';
import type { DashboardData, SchoolData, Student, Teacher } from './types';
import SchoolView from './components/SchoolView.tsx';
import TeacherView from './components/TeacherView.tsx';
import StudentView from './components/StudentView.tsx';
import AboutView from './components/AboutView.tsx';
import AchievementsView from './components/AchievementsView.tsx';
import Attendance from './components/Attendance.tsx';
import ExamResults from './components/ExamResults.tsx';
import Fees from './components/Fees.tsx';
import EventsGallery from './components/EventsGallery.tsx';
import Wellness from './components/Wellness.tsx';
import BusTracking from './components/BusTracking.tsx';
import OpinionPoll from './components/OpinionPoll.tsx';
import ParentConcerns from './components/ParentConcerns.tsx';
import FeedbackView from './components/FeedbackView.tsx';
import Notifications from './components/Notifications.tsx';
import SettingsView from './components/SettingsView.tsx';
import SpotlightView from './components/SpotlightView.tsx';
import i18n from './i18n';

const features = [
  { label: 'Announcements', image: 'https://images.unsplash.com/photo-1525009330692-5a5f6d2d2726?auto=format&fit=crop&w=600&q=80' },
  { label: 'Achievements', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80' },
  { label: 'Exam Results', image: 'https://images.unsplash.com/photo-1574680096145-72f07f6b8c48?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fee Payments', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80' },
  { label: 'Attendance', image: 'https://images.unsplash.com/photo-1520697222860-76fefe7a51fc?auto=format&fit=crop&w=600&q=80' },
  { label: 'Opinion Poll', image: 'https://images.unsplash.com/photo-1579370318444-bb5a14c48ef2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Parent Concerns', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80' },
  { label: 'Bus Tracking', image: 'https://images.unsplash.com/photo-1496950866446-325a2cdc18f9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Wellness', image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=600&q=80' },
  { label: 'Gate Pass', image: 'https://images.unsplash.com/photo-1519338701440-74e0b3c14d3d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Events & Gallery', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80' },
];

const modules = [
  { value: 'home', label: 'Home' },
  { value: 'school', label: 'School' },
  { value: 'teachers', label: 'Teachers' },
  { value: 'students', label: 'Students' },
] as const;

const sidebarItems = [
  { label: 'Home', icon: '🏠' },
  { label: 'Add Sibling', icon: '➕' },
  { label: 'Notifications', icon: '🔔' },
  { label: 'About Us', icon: 'ℹ️' },
  { label: 'Spotlight', icon: '✨' },
  { label: 'Help & Feedback', icon: '💬' },
  { label: 'Rate the App', icon: '⭐' },
  { label: 'Contact Us', icon: '📞' },
  { label: 'Settings', icon: '⚙️' },
  { label: 'Switch Account', icon: '👥' },
] as const;

type ThemePalette = 'purple' | 'teal' | 'orange' | 'blue';
type AppearanceMode = 'light' | 'dark' | 'system';
type Language = 'en' | 'te' | 'kn' | 'hi';
type ModuleView = (typeof modules)[number]['value'];

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeSidebar, setActiveSidebar] = useState('Spotlight');
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemePalette>('purple');
  const [appearance, setAppearance] = useState<AppearanceMode>('light');
  const [language, setLanguage] = useState<Language>('en');
  const [activeView, setActiveView] = useState<ModuleView>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('traitedu-theme') as ThemePalette | null;
    const savedAppearance = window.localStorage.getItem('traitedu-appearance') as AppearanceMode | null;
    const savedLanguage = window.localStorage.getItem('traitedu-language') as Language | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedAppearance) setAppearance(savedAppearance);
    if (savedLanguage) setLanguage(savedLanguage);

    Promise.all([fetchDashboard(), fetchSchool(), fetchTeachers(), fetchStudents()])
      .then(([dashboardData, schoolData, teachersData, studentsData]) => {
        setDashboard(dashboardData);
        setSchool(schoolData);
        setTeachers(teachersData);
        setStudents(studentsData);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('traitedu-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('traitedu-appearance', appearance);
  }, [appearance]);

  useEffect(() => {
    window.localStorage.setItem('traitedu-language', language);
  }, [language]);

  useEffect(() => {
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(language).catch(() => {});
    }
  }, [language]);

  const handleContinue = () => {
    setActiveSidebar('Home');
    setActiveView('home');
  };

  if (loading) {
    return (
      <main className="container centered-screen">
        <div className="loader-card">
          <p>Loading school dashboard...</p>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="container centered-screen">
        <div className="error-card">
          <p>{error ?? 'Dashboard data is unavailable.'}</p>
        </div>
      </main>
    );
  }

  return (
    <div className={`app-shell theme-${theme} appearance-${appearance}`}>
      <div className="dashboard-shell">
        <div className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-avatar"></div>
            <div>
              <p className="sidebar-name">Jyohan Naidu Girinadhuni</p>
              <p className="sidebar-subtext">5996024 · eCHAMPS</p>
            </div>
          </div>

          <div className="sidebar-menu">
            {sidebarItems.map(item => (
              <button
                key={item.label}
                className={activeSidebar === item.label ? 'sidebar-item active' : 'sidebar-item'}
                onClick={() => {
                  setActiveSidebar(item.label);
                  setIsSidebarOpen(false);
                }}>
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="dashboard-content">
          <div className="mobile-header">
            <button className="mobile-menu-button" onClick={() => setIsSidebarOpen(prev => !prev)}>
              ☰ Menu
            </button>
          </div>
          <header className="student-header">
            <div className="student-profile-card">
              <div className="profile-avatar"></div>
              <div className="profile-info">
                <p className="greeting">Good afternoon,</p>
                <h1>Jyohan Naidu Girinadhuni</h1>
                <p className="subtext">S/O G Mallikarjuna</p>
                <p className="subtext id-text">5996024</p>
                <p className="subtext school-code">E-CHAMPS-1 · NA · REGULAR · CONC · 6011</p>
              </div>
            </div>

            <button
              type="button"
              className="announcement-card announcement-action"
              onClick={() => {
                setActiveSidebar('Notifications');
                setIsSidebarOpen(false);
              }}>
              <div className="announcement-label">NEW</div>
              {dashboard.announcements && dashboard.announcements.length > 0 ? (
                <>
                  <div className="announcement-preview">
                    <img
                      src={dashboard.announcements[0].imageUrl}
                      alt={dashboard.announcements[0].title}
                    />
                  </div>
                  <div className="announcement-copy">
                    <h2>{dashboard.announcements[0].title}</h2>
                    {dashboard.announcements[0].description && (
                      <p className="announcement-description">{dashboard.announcements[0].description}</p>
                    )}
                    <p className="announcement-date">{dashboard.announcements[0].date}</p>
                  </div>
                </>
              ) : (
                <>
                  <h2>A new event is created. Check it out now!</h2>
                  <p className="announcement-date">23rd July, 2026</p>
                </>
              )}
            </button>
          </header>

          <div className="top-right-theme-palette">
            {(['purple', 'teal', 'orange', 'blue'] as const).map(option => (
              <button
                key={option}
                type="button"
                className={`theme-dot ${option} ${theme === option ? 'active' : ''}`}
                aria-label={`Set ${option} theme`}
                onClick={() => setTheme(option)}></button>
            ))}
          </div>

          <nav className="module-nav">
            {modules.map(module => (
              <button
                key={module.value}
                className={activeView === module.value ? 'active' : ''}
                onClick={() => setActiveView(module.value)}>
                {module.label}
              </button>
            ))}
          </nav>

          {activeSidebar === 'Notifications' ? (
            <div className="notification-page">
              <Notifications notifications={dashboard.notifications} />
            </div>
          ) : activeSidebar === 'About Us' ? (
            <div className="container module-panel">
              <AboutView />
            </div>
          ) : activeSidebar === 'Achievements' ? (
            <div className="container module-panel">
              <AchievementsView achievements={dashboard.achievements} />
            </div>
          ) : activeSidebar === 'Wellness' ? (
            <div className="container module-panel">
              <Wellness items={dashboard.wellness ?? []} />
            </div>
          ) : activeSidebar === 'Events & Gallery' ? (
            <div className="container module-panel">
              <EventsGallery events={dashboard.events ?? []} />
            </div>
          ) : activeSidebar === 'Bus Tracking' ? (
            <div className="container module-panel">
              <BusTracking />
            </div>
          ) : activeSidebar === 'Opinion Poll' ? (
            <div className="container module-panel">
              <OpinionPoll onBack={() => setActiveSidebar('home')} />
            </div>
          ) : activeSidebar === 'Parent Concerns' ? (
            <div className="container module-panel">
              <ParentConcerns />
            </div>
          ) : activeSidebar === 'Attendance' ? (
            <div className="container module-panel">
              <Attendance
                students={dashboard.attendance}
                onViewDetails={() => {
                  setActiveSidebar('Exam Results');
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          ) : activeSidebar === 'Exam Results' ? (
            <div className="container module-panel">
              <ExamResults results={dashboard.examResults} />
            </div>
          ) : activeSidebar === 'Fees' ? (
            <div className="container module-panel">
              <Fees fees={dashboard.fees} />
            </div>
          ) : activeSidebar === 'Help & Feedback' ? (
            <div className="container module-panel">
              <FeedbackView />
            </div>
          ) : activeSidebar === 'Settings' ? (
            <div className="container module-panel">
              <SettingsView
                appearance={appearance}
                theme={theme}
                language={language}
                onAppearanceChange={setAppearance}
                onThemeChange={setTheme}
                onLanguageChange={setLanguage}
              />
            </div>
          ) : activeSidebar === 'Spotlight' ? (
            <div className="container module-panel">
              <SpotlightView onContinue={handleContinue} />
            </div>
          ) : (
            <div className="container module-panel">
              {activeView === 'home' && (
                <>
                  <section className="dashboard-grid">
                    {dashboard.summary.map(metric => (
                      <article key={metric.title} className="metric-card">
                        <h2>{metric.title}</h2>
                        <p>{metric.value}</p>
                        <small>{metric.subtitle}</small>
                      </article>
                    ))}
                  </section>

                  <section className="dashboard-menu">
                    {features.map(feature => (
                      <button
                        key={feature.label}
                        className="feature-card"
                        onClick={() => {
                          if (feature.label === 'Achievements') {
                            setActiveSidebar('Achievements');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Announcements') {
                            setActiveSidebar('Notifications');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Fee Payments') {
                            setActiveSidebar('Fees');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Attendance') {
                            setActiveSidebar('Attendance');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Exam Results') {
                            setActiveSidebar('Exam Results');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Wellness') {
                            setActiveSidebar('Wellness');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Bus Tracking') {
                            setActiveSidebar('Bus Tracking');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Opinion Poll') {
                            setActiveSidebar('Opinion Poll');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Parent Concerns') {
                            setActiveSidebar('Parent Concerns');
                            setIsSidebarOpen(false);
                          } else if (feature.label === 'Events & Gallery') {
                            setActiveSidebar('Events & Gallery');
                            setIsSidebarOpen(false);
                          }
                        }}>
                        <div className="feature-icon">
                          <img src={feature.image} alt={feature.label} />
                        </div>
                        <span>{feature.label}</span>
                      </button>
                    ))}
                  </section>
                </>
              )}

              {activeView === 'school' && <SchoolView school={school} />}
              {activeView === 'teachers' && <TeacherView teachers={teachers} />}
              {activeView === 'students' && <StudentView students={students} />}
            </div>
          )}

          <footer className="student-footer">
            Student dashboard with module-level views for school, teachers, and students.
          </footer>
        </section>
      </div>
    </div>
  );
}
