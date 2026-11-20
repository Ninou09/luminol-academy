import { requirePermission } from '@luminol/auth';
import { db } from '@luminol/database';
import { STAFF_ROLE_KEYS, isStaffRoleKey } from '@luminol/database/staff-roles';
import { formatLocalizedDate } from '@luminol/localization';
import { z } from 'zod';

import styles from '../../components/operations.module.css';
import { CrmShell } from '../../components/crm-shell';
import { getAdminRequestLocale } from '../../lib/request-locale';
import { getTeamCopy } from '../../lib/team-localization';
import { grantStaffRoleAction, revokeStaffRoleAction } from './actions';

type TeamPageProps = {
  searchParams?: Promise<{ email?: string | string[] | undefined }>;
};

const emailSearchSchema = z.email().max(254);

function parseEmail(value: string | string[] | undefined) {
  if (typeof value !== 'string') return null;
  const parsed = emailSearchSchema.safeParse(value.trim().toLowerCase());
  return parsed.success ? parsed.data : null;
}

const memberSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  roles: { select: { role: { select: { key: true } } } },
} as const;

type Member = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: { role: { key: string } }[];
};

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const owner = await requirePermission('team:manage');
  const locale = await getAdminRequestLocale();
  const copy = getTeamCopy(locale);
  const params = searchParams ? await searchParams : undefined;
  const email = parseEmail(params?.email);

  const [staff, found, events] = await Promise.all([
    db.user.findMany({
      where: {
        deletedAt: null,
        roles: { some: { role: { key: { in: [...STAFF_ROLE_KEYS] } } } },
      },
      orderBy: { email: 'asc' },
      take: 100,
      select: memberSelect,
    }),
    email
      ? db.user.findFirst({
          where: {
            email: { equals: email, mode: 'insensitive' },
            deletedAt: null,
          },
          select: memberSelect,
        })
      : Promise.resolve(null),
    db.staffRoleAuditEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 25,
      include: {
        actor: { select: { email: true } },
        target: { select: { email: true } },
      },
    }),
  ]);

  const date = (value: Date) => formatLocalizedDate(value, locale);
  const name = (member: Member) =>
    [member.firstName, member.lastName].filter(Boolean).join(' ') ||
    member.email;

  const renderMember = (member: Member) => {
    const held = new Set(member.roles.map(({ role }) => role.key));
    const isSelf = member.id === owner.id;

    return (
      <li className={styles.row} key={member.id}>
        <div className={styles.rowBody}>
          <h3>{name(member)}</h3>
          <p className={styles.meta}>
            <bdi>{member.email}</bdi>
          </p>
          <p className={styles.meta}>
            <span>{copy.roles}:</span>
            {[...held].filter(isStaffRoleKey).length > 0
              ? [...held].filter(isStaffRoleKey).map((role) => (
                  <span className={styles.chip} key={role}>
                    {copy.roleName[role]}
                  </span>
                ))
              : copy.noRoles}
          </p>
        </div>
        {isSelf ? (
          <p className={styles.note}>{copy.ownAccount}</p>
        ) : (
          <div className={styles.actions}>
            {STAFF_ROLE_KEYS.map((role) => (
              <form
                key={role}
                action={
                  held.has(role) ? revokeStaffRoleAction : grantStaffRoleAction
                }
              >
                <input type="hidden" name="targetUserId" value={member.id} />
                <input type="hidden" name="roleKey" value={role} />
                <button
                  type="submit"
                  className={
                    held.has(role)
                      ? styles.dangerButton
                      : styles.secondaryButton
                  }
                >
                  {held.has(role) ? copy.revoke : copy.grant} ·{' '}
                  {copy.roleName[role]}
                </button>
              </form>
            ))}
          </div>
        )}
      </li>
    );
  };

  return (
    <CrmShell locale={locale} user={owner} current="team">
      <section className="admin-intro">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>{copy.findTitle}</h2>
            <p className={styles.note}>{copy.findIntro}</p>
          </div>
        </div>
        <form className={styles.inline} method="get">
          <label className={styles.field}>
            <span>{copy.emailLabel}</span>
            <input
              type="email"
              name="email"
              maxLength={254}
              defaultValue={email ?? ''}
              required
            />
          </label>
          <button type="submit" className={styles.button}>
            {copy.find}
          </button>
        </form>
        {email ? (
          found ? (
            <ul className={styles.list}>{renderMember(found)}</ul>
          ) : (
            <p className={styles.empty}>{copy.notFound}</p>
          )
        ) : null}
        <ul className={styles.list}>
          {STAFF_ROLE_KEYS.map((role) => (
            <li key={role} className={styles.note}>
              <strong>{copy.roleName[role]}</strong> —{' '}
              {copy.roleDescription[role]}
            </li>
          ))}
          <li className={styles.note}>{copy.adminNote}</li>
        </ul>
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>{copy.staffTitle}</h2>
            <p className={styles.note}>{copy.staffIntro}</p>
          </div>
        </div>
        {staff.length > 0 ? (
          <ul className={styles.list}>{staff.map(renderMember)}</ul>
        ) : (
          <p className={styles.empty}>{copy.noStaff}</p>
        )}
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <h2>{copy.auditTitle}</h2>
        </div>
        {events.length > 0 ? (
          <ul className={styles.list}>
            {events.map((event) => (
              <li className={styles.row} key={event.id}>
                <span>
                  <bdi>{event.target.email}</bdi> —{' '}
                  {isStaffRoleKey(event.roleKey)
                    ? copy.roleName[event.roleKey]
                    : event.roleKey}{' '}
                  {event.action === 'GRANTED' ? copy.granted : copy.revoked}{' '}
                  {copy.by} <bdi>{event.actor.email}</bdi>
                </span>
                <time
                  className={styles.meta}
                  dateTime={event.occurredAt.toISOString()}
                >
                  {date(event.occurredAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>{copy.noAudit}</p>
        )}
      </section>
    </CrmShell>
  );
}
