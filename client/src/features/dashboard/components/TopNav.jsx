import React from 'react';
import styles from './TopNav.module.css';
import { FiSearch, FiBell, FiSun, FiMoon, FiRefreshCw } from 'react-icons/fi';

export default function TopNav({ onRefresh }) {
    return (
        <header className={styles.topnav} role="banner">
            <div className={styles.left}>
                <div className={styles.search}><FiSearch /> <input placeholder="Search" aria-label="Search" /></div>
            </div>
            <div className={styles.right}>
                <button className={styles.icon} aria-label="Refresh" onClick={onRefresh}><FiRefreshCw /></button>
                <button className={styles.icon} aria-label="Toggle theme"><FiSun /></button>
                <button className={styles.icon} aria-label="Notifications"><FiBell /></button>
                <div className={styles.avatar} aria-hidden>❤️</div>
            </div>
        </header>
    );
}
