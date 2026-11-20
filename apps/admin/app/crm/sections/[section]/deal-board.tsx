'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type DragEvent } from 'react';

import { moveCrmDealAction } from '../actions';

export type DealCard = {
  id: string;
  name: string;
  href: string;
  stage: string;
  revision: number;
  subject: 'lead' | 'contact';
  offer: string | null;
  value: string | null;
  owner: string | null;
  expectedClose: string | null;
  consent: boolean;
};

export type DealColumn = {
  stage: string;
  label: string;
  requiresReason: boolean;
};

export type DealBoardCopy = {
  moveTo: string;
  move: string;
  moveFailed: string;
  moving: string;
  empty: string;
  dragHint: string;
  reasonLabel: string;
  confirm: string;
  cancel: string;
  unassigned: string;
  lead: string;
  contact: string;
  noConsent: string;
};

type DealBoardProps = {
  columns: DealColumn[];
  cards: DealCard[];
  transitions: Record<string, readonly string[]>;
  copy: DealBoardCopy;
  feedback: Record<string, string>;
};

type PendingMove = { card: DealCard; toStage: string };

export function DealBoard({
  columns,
  cards: initialCards,
  transitions,
  copy,
  feedback,
}: DealBoardProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [dragging, setDragging] = useState<DealCard | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reasonFor, setReasonFor] = useState<PendingMove | null>(null);
  const [pending, startTransition] = useTransition();

  const labelOf = (stage: string) =>
    columns.find((column) => column.stage === stage)?.label ?? stage;
  const needsReason = (stage: string) =>
    columns.find((column) => column.stage === stage)?.requiresReason ?? false;
  const canMove = (card: DealCard, toStage: string) =>
    card.stage !== toStage && (transitions[card.stage] ?? []).includes(toStage);

  const commit = (card: DealCard, toStage: string, reason?: string) => {
    const previous = cards;
    setError(null);
    setReasonFor(null);
    setCards((current) =>
      current.map((item) =>
        item.id === card.id ? { ...item, stage: toStage } : item,
      ),
    );
    startTransition(async () => {
      const result = await moveCrmDealAction({
        dealId: card.id,
        toStage,
        revision: card.revision,
        ...(reason ? { reason } : {}),
      });
      if (!result.ok) {
        setCards(previous);
        setError(feedback[result.code] ?? copy.moveFailed);
        return;
      }
      router.refresh();
    });
  };

  const move = (card: DealCard, toStage: string) => {
    if (!canMove(card, toStage)) return;
    if (needsReason(toStage)) {
      setReasonFor({ card, toStage });
      return;
    }
    commit(card, toStage);
  };

  const onDragStart = (card: DealCard) => (event: DragEvent) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', card.id);
    setDragging(card);
  };

  const onDragOver = (stage: string) => (event: DragEvent) => {
    if (dragging && canMove(dragging, stage)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setTarget(stage);
    }
  };

  const onDrop = (stage: string) => (event: DragEvent) => {
    event.preventDefault();
    if (dragging) move(dragging, stage);
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
      {reasonFor ? (
        <form
          className="crm-board-reason"
          aria-label={copy.reasonLabel}
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const reason = data.get('reason');
            if (typeof reason === 'string' && reason.trim().length >= 2) {
              commit(reasonFor.card, reasonFor.toStage, reason.trim());
            }
          }}
        >
          <label>
            <span>
              {copy.reasonLabel}: <bdi>{reasonFor.card.name}</bdi> →{' '}
              {labelOf(reasonFor.toStage)}
            </span>
            <input
              type="text"
              name="reason"
              minLength={2}
              maxLength={240}
              required
              autoFocus
            />
          </label>
          <button type="submit" disabled={pending}>
            {copy.confirm}
          </button>
          <button type="button" onClick={() => setReasonFor(null)}>
            {copy.cancel}
          </button>
        </form>
      ) : null}
      <div className="crm-board">
        {columns.map((column) => {
          const columnCards = cards.filter(
            ({ stage }) => stage === column.stage,
          );
          const droppable = dragging ? canMove(dragging, column.stage) : false;
          return (
            <section
              key={column.stage}
              className="crm-board-column"
              data-droppable={droppable || undefined}
              data-target={target === column.stage || undefined}
              aria-label={column.label}
              onDragOver={onDragOver(column.stage)}
              onDragLeave={() => setTarget(null)}
              onDrop={onDrop(column.stage)}
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
                    const targets = transitions[card.stage] ?? [];
                    return (
                      <li
                        key={card.id}
                        className="crm-card"
                        draggable={!pending && targets.length > 0}
                        onDragStart={onDragStart(card)}
                        onDragEnd={() => {
                          setDragging(null);
                          setTarget(null);
                        }}
                      >
                        <Link href={card.href}>
                          <bdi>{card.name}</bdi>
                        </Link>
                        <p>
                          {card.subject === 'lead' ? copy.lead : copy.contact}
                          {card.offer ? (
                            <>
                              {' '}
                              · <bdi>{card.offer}</bdi>
                            </>
                          ) : null}
                        </p>
                        <p className="crm-card-meta">
                          <span>
                            {card.owner ? (
                              <bdi>{card.owner}</bdi>
                            ) : (
                              copy.unassigned
                            )}
                          </span>
                          {card.value ? <span>{card.value}</span> : null}
                          {card.expectedClose ? (
                            <span>{card.expectedClose}</span>
                          ) : null}
                        </p>
                        {!card.consent ? (
                          <p className="crm-card-overdue">{copy.noConsent}</p>
                        ) : null}
                        {targets.length > 0 ? (
                          <form
                            className="crm-card-move"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const data = new FormData(event.currentTarget);
                              const toStage = data.get('toStage');
                              if (typeof toStage === 'string')
                                move(card, toStage);
                            }}
                          >
                            <label>
                              <span className="sr-only">
                                {copy.moveTo}: {card.name}
                              </span>
                              <select name="toStage" defaultValue={targets[0]}>
                                {targets.map((stage) => (
                                  <option key={stage} value={stage}>
                                    {copy.moveTo} {labelOf(stage)}
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
