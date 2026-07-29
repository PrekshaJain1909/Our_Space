import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './MoodPage.module.css';
import moodApi from '../../../api/moodApi';
import MoodPageSkeleton from '../components/MoodPageSkeleton';

const moodOptions = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: '#61d24d' },
  { value: 'romantic', label: 'Romantic', emoji: '🥰', color: '#f56fd4' },
  { value: 'loved', label: 'Loved', emoji: '😍', color: '#f96fb7' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: '#b9b4f0' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: '#8fb4ff' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: '#5573ff' },
  { value: 'crying', label: 'Crying', emoji: '😭', color: '#7366ff' },
  { value: 'angry', label: 'Angry', emoji: '😡', color: '#ff7a85' },
  { value: 'upset', label: 'Upset', emoji: '💔', color: '#ef5e7a' },
];

const legendItems = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '🟣', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '🔵', label: 'Sad' },
  { emoji: '😭', label: 'Crying' },
  { emoji: '🔴', label: 'Angry' },
];

const menuOptions = [
  { value: 'me', label: '👩 My Mood' },
  { value: 'both', label: '❤️ Both' },
  { value: 'partner', label: '👨 Partner Mood' },
];

const statsCards = [
  { icon: '😊', label: 'Your Happy Days', value: '18' },
  { icon: '❤️', label: 'Partner Happy Days', value: '16' },
  { icon: '💕', label: 'Happy Together', value: '12 Days' },
  { icon: '😢', label: 'Sad Days', value: '4' },
  { icon: '🔥', label: 'Longest Happy Streak', value: '7 Days' },
  { icon: '📈', label: 'Relationship Mood Score', value: '87%' },
];

const buildCalendar = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < startWeekday; index += 1) cells.push(null);
  for (let index = 1; index <= daysInMonth; index += 1) {
    const dateObj = new Date(year, month, index);
    const iso = dateObj.toISOString().slice(0, 10);
    cells.push({ iso, day: index, dateObj });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

function getAIDescription(moodFrequency = []) {
  if (!moodFrequency.length) return 'No mood history yet. Log your first mood to get a weekly summary.';
  const happyCount = moodFrequency.find((item) => item.mood === 'happy')?.count || 0;
  const sadCount = moodFrequency.find((item) => item.mood === 'sad')?.count || 0;
  const upsetCount = moodFrequency.find((item) => item.mood === 'upset')?.count || 0;
  if (happyCount >= sadCount + upsetCount) {
    return 'You have been mostly positive this week. Keep the momentum by planning a short quality moment together.';
  }
  if (upsetCount > 1) {
    return 'A few upset entries appeared this week. Check in gently and talk through what felt off.';
  }
  return 'Your mood trend is steady. Continue celebrating the good days and stay kind to each other on the tougher ones.';
}

export default function MoodPage() {
  const [loading, setLoading] = useState(true);
  const [selectedScope, setSelectedScope] = useState('both');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMood, setSelectedMood] = useState('happy');
  const [description, setDescription] = useState('');
  const [moodMap, setMoodMap] = useState({});
  const [upsetEntries, setUpsetEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      setApiError('');
      try {
        const [moodsRes, statsRes, upsetRes] = await Promise.all([
          moodApi.getMoods({ month: calendarMonth.toISOString().slice(0, 7) }),
          moodApi.getMoodStats(),
          moodApi.getUpset(),
        ]);

        if (!mounted) return;

        const moodItems = moodsRes?.data?.data || [];
        setMoodMap(
          moodItems.reduce((acc, item) => {
            if (item?.date) acc[item.date] = item;
            return acc;
          }, {})
        );
        setStats(statsRes?.data?.data || null);
        setUpsetEntries(upsetRes?.data?.data || []);
      } catch (error) {
        console.error(error);
        if (mounted) setApiError('Unable to load mood data. Please refresh.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [calendarMonth]);

  const selectedEntry = moodMap[selectedDate] || null;
  const selectedOwner = selectedEntry?.owner || 'You';
  const selectedEmoji = selectedEntry?.emoji || '😊';
  const selectedNote = selectedEntry?.note || 'Write about your day to capture the moment.';

  const calendarCells = useMemo(() => buildCalendar(calendarMonth), [calendarMonth]);
  const weeklyTrend = stats?.recentTrend || [];
  const moodFrequency = stats?.moodFrequency || [];
  const totalLogs = stats?.totalLogs || 0;

  const trendPath = useMemo(() => {
    if (!weeklyTrend.length) return '';
    const width = 600;
    const height = 230;
    const padding = 20;
    const maxScore = Math.max(...weeklyTrend.map((item) => item.score), 5);
    const minScore = Math.min(...weeklyTrend.map((item) => item.score), 1);
    return weeklyTrend
      .map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / (weeklyTrend.length - 1);
        const y = height - padding - ((item.score - minScore) / (maxScore - minScore || 1)) * (height - padding * 2);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [weeklyTrend]);

  const distributionSegments = useMemo(() => {
    const total = moodFrequency.reduce((sum, item) => sum + item.count, 0) || 1;
    let startAngle = 0;
    return moodFrequency.map((item) => {
      const value = item.count / total;
      const angle = value * Math.PI * 2;
      const largeArc = angle > Math.PI ? 1 : 0;
      const x1 = 100 + Math.sin(startAngle) * 72;
      const y1 = 100 - Math.cos(startAngle) * 72;
      const x2 = 100 + Math.sin(startAngle + angle) * 72;
      const y2 = 100 - Math.cos(startAngle + angle) * 72;
      const path = `M 100 100 L ${x1} ${y1} A 72 72 0 ${largeArc} 1 ${x2} ${y2} Z`;
      startAngle += angle;
      return {
        ...item,
        path,
        color: item.mood === 'happy' ? '#61d24d' : item.mood === 'romantic' ? '#f96fb7' : item.mood === 'neutral' ? '#b9b4f0' : item.mood === 'tired' ? '#8fb4ff' : item.mood === 'sad' ? '#5573ff' : item.mood === 'crying' ? '#7366ff' : item.mood === 'angry' ? '#ff7a85' : '#f6b1d8',
      };
    });
  }, [moodFrequency]);

  const handleSaveMood = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        mood: selectedMood,
        emoji: moodOptions.find((item) => item.value === selectedMood)?.emoji,
        note: description,
        date: selectedDate,
      };
      await moodApi.addMood(payload);
      setMoodMap((prev) => ({ ...prev, [selectedDate]: payload }));
      setDescription('');
    } catch (error) {
      console.error(error);
      setApiError('Unable to save mood entry.');
    }
  };

  if (loading) return <MoodPageSkeleton />;

  return (
    <>
      <header className="healing-hero-card">
        <div className="healing-hero-glow" />
        <p className="healing-badge">Mood & Upset Space</p>

        <h1 className="healing-title">
          How Are We Really Doing?
        </h1>
      </header>
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.grid2x1}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>❤️ Shared Mood Calendar</h2>
                  <p className={styles.cardText}>Switch between perspectives and tap any day to view details.</p>
                </div>
              </div>
              <div className={styles.segmentRow}>
                {menuOptions.map((menu) => (
                  <button
                    key={menu.value}
                    type="button"
                    className={`${styles.segmentButton} ${selectedScope === menu.value ? styles.segmentButtonActive : ''}`}
                    onClick={() => setSelectedScope(menu.value)}
                  >
                    {menu.label}
                  </button>
                ))}
              </div>
              <div className={styles.calendarWrapper}>
                <div className={styles.calendarHeader}>
                  <div>
                    <p className={styles.calendarTitle}>{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className={styles.calendarActions}>
                    <button
                      type="button"
                      className={styles.controlButton}
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      type="button"
                      className={styles.controlButton}
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
                <div className={styles.calendarGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, idx) => (
                    <div key={`${label}-${idx}`} className={styles.dayLabel}>
                      {label}
                    </div>
                  ))}
                  {calendarCells.map((cell, idx) => {
                    if (!cell) return <div key={`empty-${idx}`} className={styles.dayCell} />;
                    const isToday = cell.iso === new Date().toISOString().slice(0, 10);
                    const isSelected = cell.iso === selectedDate;
                    const entry = moodMap[cell.iso];
                    return (
                      <button
                        type="button"
                        key={cell.iso}
                        className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ''} ${isSelected ? styles.dayCellSelected : ''}`}
                        onClick={() => setSelectedDate(cell.iso)}
                      >
                        <div className={styles.dayTop}>
                          <span className={styles.dayNumber}>{cell.day}</span>
                          <span className={styles.moodIndicator}>{entry?.emoji || '•'}</span>
                        </div>
                        <div className={styles.dayEmoji}>{entry?.emoji || ''}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.detailsPanel}>
              <div className={styles.detailsContent}>
                <div className={styles.previewCard}>
                  <p className={styles.previewHeading}>Selected Mood</p>
                  <div className={styles.previewEmoji}>{selectedEmoji}</div>
                  <div className={styles.previewMeta}>
                    <span className={styles.previewTag}>
                      {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <span className={styles.previewTag}>Logged by {selectedOwner}</span>
                  </div>
                  <p className={styles.cardText}>{selectedNote}</p>
                </div>

                <form className={styles.formPanel} onSubmit={handleSaveMood}>
                  <div>
                    <p className={styles.formTitle}>Mood Entry</p>
                  </div>
                  <div className={styles.emojiGrid}>
                    {moodOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`${styles.emojiButton} ${selectedMood === option.value ? styles.emojiButtonActive : ''}`}
                        onClick={() => setSelectedMood(option.value)}
                      >
                        <span>{option.emoji}</span>
                        <div style={{ fontSize: 12, marginTop: 6 }}>{option.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className={styles.descriptionField}>
                    <label htmlFor="mood-note">Write about your day...</label>
                    <textarea
                      id="mood-note"
                      maxLength={300}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write about your day..."
                    />
                  </div>
                  <div className={styles.formFooter}>
                    <span className={styles.charCount}>{description.length}/300</span>
                    <div className={styles.buttonRow}>
                      <button type="submit" className={styles.buttonPrimary}>Save Mood</button>
                      <button type="button" className={styles.buttonOutline}>Edit</button>
                      <button type="button" className={styles.buttonDanger}>Delete</button>
                      <button type="button" className={styles.buttonGhost}>Cancel</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>🤖 AI Relationship Insight</h2>
                <p className={styles.cardText}>A quick emotional summary from your latest mood history.</p>
              </div>
            </div>
            <div className={styles.panelPadding}>
              <div className={styles.aiSummary}>{getAIDescription(moodFrequency)}</div>
            </div>
          </div>

          <div className={styles.grid2x1}>
            <div className={`${styles.panel} ${styles.aiCard}`}>
              <div className={styles.panelPadding}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>Mood Analytics</h3>
                    <p className={styles.cardText}>Understand emotional trends over time.</p>
                  </div>
                </div>
                <button type="button" className={styles.analyticsCta}>View Analytics →</button>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.summaryGrid}`}>
              {['Your Average Mood', 'Partner Average Mood', 'Combined Happiness'].map((label, idx) => (
                <div key={label} className={styles.summaryCard}>
                  <p className={styles.summaryLabel}>{label}</p>
                  <p className={styles.summaryValue}>{['82%', '79%', '85%'][idx]}</p>
                  <div style={{ height: 8, borderRadius: 999, marginTop: 12, background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      style={{
                        width: ['82%', '79%', '85%'][idx],
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, rgba(232,84,184,0.92), rgba(138,92,246,0.92))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.grid2x1}>
            <div className={`${styles.panel} ${styles.trendCard}`}>
              <div className={styles.panelPadding}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Weekly Mood Trend</h3>
                </div>
                <svg viewBox="0 0 600 230" className={styles.chartSvg}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#e854b8" />
                      <stop offset="100%" stopColor="#8a5cf6" />
                    </linearGradient>
                  </defs>
                  <path d={trendPath} fill="none" stroke="url(#lineGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className={styles.chartLegend}>
                  {weeklyTrend.map((item) => (
                    <div key={item.label} className={styles.chartLegendItem}>
                      <span className={styles.legendDot} style={{ background: '#8a5cf6' }} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.distributionCard}`}>
              <div className={styles.panelPadding}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Mood Distribution</h3>
                </div>
                <div className={styles.donutWrapper}>
                  <svg viewBox="0 0 200 200" width="100%" height="100%">
                    {distributionSegments.map((segment, idx) => (
                      <path key={`${segment.mood}-${idx}`} d={segment.path} fill={segment.color} opacity="0.95" />
                    ))}
                    <circle cx="100" cy="100" r="36" fill="var(--card-bg)" />
                  </svg>
                </div>
                <div className={styles.donutLegend}>
                  {distributionSegments.slice(0, 6).map((segment) => (
                    <div key={segment.mood} className={styles.donutLegendItem}>
                      <span className={styles.legendDot} style={{ background: segment.color }} />
                      <span>{segment.mood}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grid2x1}>
            <div className={`${styles.panel} ${styles.timelineCard}`}>
              <div className={styles.panelPadding}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recent Upsets Timeline</h3>
                </div>
                <div className={styles.timelineList}>
                  {upsetEntries.length ? (
                    upsetEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id || entry.date} className={styles.timelineItem}>
                        <div className={styles.timelineItemHeader}>
                          <h4 className={styles.timelineItemTitle}>{entry.reason || 'Misunderstanding'}</h4>
                          <span className={styles.previewTag}>{entry.date}</span>
                        </div>
                        <div className={styles.timelineMeta}>
                          <span>{entry.pov === 'male' ? 'Partner' : 'You'}</span>
                          <span>{entry.intensity ? `Intensity ${entry.intensity}/10` : 'Unresolved'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.cardText}>No upset entries yet. Your timeline will appear here once you log a feeling.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.suggestionsCard}`}>
              <div className={styles.panelPadding}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>✨ Suggestions</h3>
                </div>
                <div className={styles.suggestionsList}>
                  {['Appreciate your partner today', 'Plan a movie night', 'Write a Love Note', 'Spend quality time together'].map((line) => (
                    <div key={line} className={styles.suggestionLine}>
                      <span className={styles.suggestionBullet}>•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                padding: '16px 20px',
                borderRadius: 20,
                background: 'rgba(20, 10, 30, 0.94)',
                color: '#fff',
                zIndex: 50,
                boxShadow: '0 20px 40px rgba(0,0,0,0.28)',
              }}
            >
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
