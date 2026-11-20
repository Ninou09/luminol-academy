'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type DragEvent } from 'react';

import { moveLeadStageAction } from '../actions';

export type PipelineCard = {
  id: string;
  name: string;
  href: string;
  status: string;
  school: string;
  programme: string | null;
  owner: string | null;
  followUp: string | null;
  overdue: boolean;
  consent: boolean;
  source: string;
  received: string;
  priority: { band: 'hot' | 'warm' | 'cold'; label: string };
};

export type PipelineColumn = {
  status: string;
  label: string;
};

export type PipelineBoardCopy = {
  moveTo: string;
  move: string;
  moveFailed: string;
  moving: string;
  unassigned: string;
  overdue: string;
  noConsent: string;
  empty: string;
  dragHint: string;
};

type PipelineBoardProps = {
  columns: PipelineColumn[];
  cards: PipelineCard[];
  transitions: Record<string, readonly string[]>;
  copy: PipelineBoardCopy;
  labels: Record<string, string>;
};

export function PipelineBoard({
  columns,
  cards: initialCards,
  transitions,
  copy,
  labels,
}: PipelineBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [dragging, setDragging] = useState<PipelineCard | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canMove = (card: PipelineCard, toStatus: string) =>
    card.status !== toStatus &&
    (transitions[card.status] ?? []).includes(toStatus);

  const move = (card: PipelineCard, toStatus: string) => {
    if (!canMove(card, toStatus)) return;
    const previous = cards;
    setError(null);
    setCards((current) =>
      current.map((item) =>
        item.id === card.id ? { ...item, status: toStatus } : item,
      ),
    );
    startTransition(async () => {
      const result = await moveLeadStageAction({
        enquiryId: card.id,
        toStatus,
      });
      if (!result.ok) {
        setCards(previous);
        setError(copy.moveFailed);
        return;
      }
      router.refresh();
    });
  };

  const onDragStart = (card: PipelineCard) => (event: DragEvent) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.id);
    setDragging(card);
  };

  const onDragOver = (status: string) => (event: DragEvent) => {
    if (dragging && canMove(dragging, status)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setTarget(status);
    }
  };

  const onDrop = (status: string) => (event: DragEvent) => {
    event.preventDefault();
    if (dragging) move(dragging, status);
    setDragging(null);
    setTarget(null);
  };

  return (
    <div className="crm-board-wrap">
      <p className="crm-board-hint">{copy.dragHint}</p>
      {error ? (
        <p className="crm-board-error" role="alert">
          {error}
        </p>
      ) : null}
      {pending ? (
        <p className="crm-board-hint" role="status">
          {copy.moving}
        </p>
      ) : null}
      <div className="crm-board">
        {columns.map((column) => {
          const columnCards = cards.filter(
            ({ status }) => status === column.status,
          );
          const droppable = dragging ? canMove(dragging, column.status) : false;
          return (
            <section
              key={column.status}
              className="crm-board-column"
              data-droppable={droppable || undefined}
              data-target={target === column.status || undefined}
              aria-label={column.label}
              onDragOver={onDragOver(column.status)}
              onDragLeave={() => setTarget(null)}
              onDrop={onDrop(column.status)}
            >
              <header>
                <h2>{column.label}</h2>
                <span>{columnCards.length}</span>
              </header>
              {columnCards.length === 0 ? (
                <p className="crm-board-empty">{copy.empty}</p>
              ) : (
                <ul>
                  {columnCards.map((card) => {
                    const targets = transitions[card.status] ?? [];
                    return (
                      <li
                        key={card.id}
                        className="crm-card"
                        draggable={!pending}
                        onDragStart={onDragStart(card)}
                        onDragEnd={() => {
                          setDragging(null);
                          setTarget(null);
                        }}
                        data-overdue={card.overdue || undefined}
                      >
                        <Link href={card.href}>
                          <bdi>{card.name}</bdi>
                        </Link>
                        <p>
                          {card.school}
                          {card.programme ? (
                            <>
                              {' '}
                              · <bdi>{card.programme}</bdi>
                            </>
                          ) : null}
                        </p>
                        <p className="crm-card-meta">
                          <span
                            className="crm-score"
                            data-band={card.priority.band}
                          >
                            {card.priority.label}
                          </span>
                          <span>
                            {card.owner ? (
                              <bdi>{card.owner}</bdi>
                            ) : (
                              copy.unassigned
                            )}
                          </span>
                          <span>{card.source}</span>
                          <span>{card.received}</span>
                        </p>
                        {card.followUp ? (
                          <p
                            className={
                              card.overdue
                                ? 'crm-card-overdue'
                                : 'crm-card-meta'
                            }
                          >
                            {card.overdue ? `${copy.overdue} · ` : ''}
                            {card.followUp}
                          </p>
                        ) : null}
                        {!card.consent ? (
                          <p className="crm-card-overdue">{copy.noConsent}</p>
                        ) : null}
                        {targets.length > 0 ? (
                          <form
                            className="crm-card-move"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const data = new FormData(event.currentTarget);
                              const toStatus = data.get('toStatus');
                              if (typeof toStatus === 'string')
                                move(card, toStatus);
                            }}
                          >
                            <label>
                              <span className="sr-only">
                                {copy.moveTo}: {card.name}
                              </span>
                              <select name="toStatus" defaultValue={targets[0]}>
                                {targets.map((status) => (
                                  <option key={status} value={status}>
                                    {copy.moveTo} {labels[status] ?? status}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <button type="submit" disabled={pending}>
                              {copy.move}
                            </button>
                          </form>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
