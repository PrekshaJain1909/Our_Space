import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAlbumCatalog, getAlbumMemoryCount, isDeletedWithinRetention } from './albumState.js';

test('buildAlbumCatalog creates favorites and recently deleted only when needed', () => {
    const albums = [];
    const memories = [
        { id: 'm1', albumId: 'trip-1', isFavorite: true, isDeleted: false },
        { id: 'm2', albumId: 'trip-1', isFavorite: false, isDeleted: true, deletedAt: new Date().toISOString() },
    ];

    const nextAlbums = buildAlbumCatalog(albums, memories);
    const favoritesAlbum = nextAlbums.find((album) => album.id === 'favorites');
    const deletedAlbum = nextAlbums.find((album) => album.id === 'recently-deleted');

    assert.ok(favoritesAlbum);
    assert.ok(deletedAlbum);
    assert.equal(getAlbumMemoryCount(favoritesAlbum, memories), 1);
    assert.equal(getAlbumMemoryCount(deletedAlbum, memories), 1);
});

test('buildAlbumCatalog hides favorites and recently deleted when they have no content', () => {
    const albums = [{ id: 'favorites', name: '❤️ Favorites', memoryCount: 1, isSystem: true }];
    const memories = [{ id: 'm1', albumId: 'trip-1', isFavorite: false, isDeleted: false }];

    const nextAlbums = buildAlbumCatalog(albums, memories);
    const favoritesAlbum = nextAlbums.find((album) => album.id === 'favorites');

    assert.equal(favoritesAlbum?.memoryCount, 0);
    assert.equal(nextAlbums.filter((album) => album.id === 'favorites').length, 1);
});

test('isDeletedWithinRetention returns false for expired deletions', () => {
    const memory = {
        id: 'm1',
        isDeleted: true,
        deletedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    };

    assert.equal(isDeletedWithinRetention(memory), false);
});
