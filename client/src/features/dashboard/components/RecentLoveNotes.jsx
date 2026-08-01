import React from 'react';
import styles from './RecentLoveNotes.module.css';

export default function RecentLoveNotes({ notes = [] }) {
    const hasNotes = Array.isArray(notes) && notes.length > 0;

    return (
        <div className={styles.card}>
            <h4>Recent Love Notes</h4>
            {hasNotes ? (
                <div className={styles.list}>
                    {notes.slice(0, 3).map((n) => (
                        <blockquote key={n._id || n.id} className={styles.note}>
                            <p>“{n.message || n.content || '—'}”</p>
                            <footer>{n.senderName || 'You'} • {new Date(n.createdAt || Date.now()).toLocaleString()}</footer>
                        </blockquote>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💌</div>
                    <h4>No notes yet</h4>
                    <p>Write Love Notes to make this feed feel alive.</p>
                </div>
            )}
        </div>
    );
}
