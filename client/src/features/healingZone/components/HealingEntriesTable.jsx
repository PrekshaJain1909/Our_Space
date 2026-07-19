import React from "react";
import PunishmentCardList from './PunishmentCardList';
import "./HealingZone.css";

/**
 * entries = [
 *  { id, apologizer, forgiver, why, punishment, status, createdAt, doneAt }
 * ]
 */
export default function HealingEntriesTable({
  entries = [],
  onComplete = null,
  onDelete = null,
  onRequestComplete = null,
  onCompleteEntry = null,
  onCompletePromise = null,
  onEditEntry = null,
  onEditPromise = null,
  onDeleteEntry = null,
  onDeletePromise = null,
  onForgiveEntry = null,
}) {
  return (
    <PunishmentCardList
      entries={entries}
      currentUserName={typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').name || '') : ''}
      onRequestComplete={onRequestComplete}
      onCompleteEntry={onCompleteEntry || onComplete}
      onCompletePromise={onCompletePromise}
      onEditEntry={onEditEntry}
      onEditPromise={onEditPromise}
      onDeleteEntry={onDeleteEntry || onDelete}
      onDeletePromise={onDeletePromise}
      onForgiveEntry={onForgiveEntry}
    />
  );
}