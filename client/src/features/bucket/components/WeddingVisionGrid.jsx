import React from 'react';
import axiosClient from '../../../api/axiosClient';
import MemoryGrid from '../../memoryBox/components/MemoryGrid';
import '../../memoryBox/MemoryBox.css';
import './WeddingVision.css';

export default function WeddingVisionGrid({ items = [], onToggleFavorite, onDelete, onShare, onAddFirst }) {
    const apiBase = (axiosClient.defaults?.baseURL || '').replace(/\/api\/?$/, '') || window.location.origin;

    const resolveImage = (it) => {
        const candidates = [];
        if (it.image) candidates.push(it.image);
        if (it.imageUrl) candidates.push(it.imageUrl);
        if (it.photo) candidates.push(it.photo);
        if (Array.isArray(it.photos) && it.photos.length) candidates.push(it.photos[0]);
        if (it.photos && typeof it.photos === 'string') candidates.push(it.photos);

        const found = candidates.find(Boolean);
        if (!found) return null;
        if (found.startsWith('http') || found.startsWith('//')) return found;
        if (found.startsWith('/')) return apiBase + found;
        // fallback: assume relative path
        return apiBase + '/' + found.replace(/^\/+/, '');
    };

    const mapped = (items || []).map((it) => ({
        id: it._id || it.id,
        title: it.title || it.name || 'Untitled',
        imageUrl: resolveImage(it),
        mood: (it.type || 'others').toLowerCase(),
        location: it.referenceLink || it.location || '',
        date: it.date || it.createdAt || null,
        isFavorite: Boolean(it.favorite || it.isFavorite),
    }));

    if (!mapped || mapped.length === 0) {
        return (
            <div className="memory-glass-card memory-empty-state-card">
                <div className="memory-card-header">
                    <p className="memory-section-tag">🤵🏻👰🏻 Wedding Vision</p>
                    <h2>Your dream wedding starts here 💍</h2>
                </div>
                <div className="memory-empty-card">
                    <div className="memory-empty-icon">💍🌸</div>
                    <h3 className="memory-empty-title">Add your first inspiration.</h3>
                    <p className="memory-empty-copy">Pin dresses, venues, playlists and vendor links to build your moodboard.</p>
                    <button type="button" className="memory-submit-btn" onClick={onAddFirst}>
                        Add Vision
                    </button>
                </div>
            </div>
        );
    }

    return (
        <MemoryGrid
            memories={mapped}
            onToggleFavorite={(id) => onToggleFavorite && onToggleFavorite(id)}
            onShare={(mem) => onShare && onShare(mem)}
            onDelete={(mem) => onDelete && onDelete({ _id: mem.id })}
        />
    );
}
