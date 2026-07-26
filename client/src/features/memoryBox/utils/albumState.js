const RETENTION_DAYS = 30;

export function isDeletedWithinRetention(memory) {
    if (!memory?.isDeleted) return false;
    if (!memory.deletedAt) return true;

    const deletedAt = new Date(memory.deletedAt);
    if (Number.isNaN(deletedAt.getTime())) return true;

    const ageMs = Date.now() - deletedAt.getTime();
    return ageMs < RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

export function getAlbumMemoryCount(album, memories = []) {
    if (!album) return 0;

    if (album.id === 'favorites') {
        return memories.filter((memory) => memory.isFavorite && !memory.isDeleted).length;
    }

    if (album.id === 'recently-deleted') {
        return memories.filter((memory) => isDeletedWithinRetention(memory)).length;
    }

    return memories.filter((memory) => memory.albumId === album.id && !memory.isDeleted).length;
}

export function buildAlbumCatalog(albums = [], memories = []) {
    const manualAlbums = (albums || []).filter((album) => !album.isSystem);
    const systemAlbums = (albums || []).filter((album) => album.isSystem);
    const nextAlbums = [...manualAlbums];

    const favoritesCount = memories.filter((memory) => memory.isFavorite && !memory.isDeleted).length;
    const deletedCount = memories.filter((memory) => isDeletedWithinRetention(memory)).length;

    const favoritesAlbum = systemAlbums.find((album) => album.id === 'favorites');
    const deletedAlbum = systemAlbums.find((album) => album.id === 'recently-deleted');

    if (favoritesCount > 0 || favoritesAlbum) {
        nextAlbums.unshift({
            ...(favoritesAlbum || {}),
            id: 'favorites',
            name: favoritesAlbum?.name || '❤️ Favorites',
            coverImage: favoritesAlbum?.coverImage || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
            creator: favoritesAlbum?.creator || 'System',
            createdAt: favoritesAlbum?.createdAt || new Date().toISOString(),
            folderId: 'favorites',
            memoryCount: favoritesCount,
            photoCount: favoritesCount,
            isSystem: true,
        });
    }

    if (deletedCount > 0 || deletedAlbum) {
        nextAlbums.splice(favoritesCount > 0 || favoritesAlbum ? 1 : 0, 0, {
            ...(deletedAlbum || {}),
            id: 'recently-deleted',
            name: deletedAlbum?.name || '🗑 Recently Deleted',
            coverImage: deletedAlbum?.coverImage || 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
            creator: deletedAlbum?.creator || 'System',
            createdAt: deletedAlbum?.createdAt || new Date().toISOString(),
            folderId: 'recently-deleted',
            memoryCount: deletedCount,
            photoCount: deletedCount,
            isSystem: true,
        });
    }

    return nextAlbums.map((album) => ({
        ...album,
        memoryCount: getAlbumMemoryCount(album, memories),
        photoCount: getAlbumMemoryCount(album, memories),
    }));
}
