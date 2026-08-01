import React from 'react';
import styles from './Sidebar.module.css';
import { FiHome, FiBell, FiSettings } from 'react-icons/fi';

export default function Sidebar() {
    return (
        <aside className={styles.sidebar} aria-label="Main sidebar">
            <div className={styles.brand}>Together</div>
            <nav className={styles.nav}>
                <button className={styles.link}><FiHome /> Dashboard</button>
                <button className={styles.link}><FiBell /> Notifications</button>
                <button className={styles.link}><FiSettings /> Settings</button>
            </nav>
            <div className={styles.footer}>Made with ❤️ for each other</div>
        </aside>
    );
}
