import React from 'react';
import styles from './ThemeCard.module.css';

const ThemeCard = React.forwardRef(function ThemeCard({ as: Component = 'div', className = '', children, ...props }, ref) {
    return (
        <Component ref={ref} className={[styles.card, className].filter(Boolean).join(' ')} {...props}>
            {children}
        </Component>
    );
});

export default ThemeCard;
