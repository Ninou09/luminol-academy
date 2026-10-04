import { museCommandSchema } from '@luminol/validation/muse';
import type { MuseResponse } from '@luminol/types/muse';
import type { PrismaClient, Prisma } from '../generated/prisma/client';
import { routeMuseCommand, museKnowledgeTerms } from './muse-policy';

export {
  MUSE_AGENTS,
  routeMuseCommand,
  museAttentionScore,
} from './muse-policy';

export async function runMuseCommand(
  client: PrismaClient,
  actorId: string,
  raw: unknown,
) {
  const command = museCommandSchema.parse(raw);
  const intent = command.intent ?? routeMuseCommand(command.prompt);
  const actor = await client.user.findUniqueOrThrow({
    where: { id: actorId, deletedAt: null },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  const can = (key: string) =>
    actor.roles.some(({ role }) =>
      role.permissions.some(({ permission }) => permission.key === key),
    );
  if (
    !can('academy:manage') ||
    (intent === 'revenue' && !can('finance:manage'))
  )
    throw new Error('MUSE_FORBIDDEN');
  const existing = await client.museRun.findUnique({
    where: { requestId: command.requestId },
  });
  if (existing) {
    if (
      existing.actorId !== actorId ||
      existing.prompt !== command.prompt ||
      existing.intent !== intent
    )
      throw new Error('MUSE_REQUEST_CONFLICT');
    return existing;
  }
  const locale = command.locale;
  const choose = (ar: string, fr: string, en: string) =>
    locale === 'ar' ? ar : locale === 'fr' ? fr : en;
  const now = new Date();
  const evidence = (label: string, reference: string) => ({
    label,
    reference,
    observedAt: now.toISOString(),
  });
  let response: MuseResponse = {
    agent: 'main',
    text: '',
    evidence: [],
    mode: 'local',
  };
  const active = {
    status: {
      in: ['NEW', 'IN_REVIEW', 'CONTACTED'] as (
        'NEW' | 'IN_REVIEW' | 'CONTACTED'
      )[],
    },
  };

  if (intent === 'briefing' || intent === 'triage' || intent === 'follow-up') {
    const [total, overdue, unassigned, missing, courseLeads] =
      await Promise.all([
        client.enquiry.count({ where: active }),
        client.enquiry.count({
          where: { ...active, nextFollowUpAt: { lt: now } },
        }),
        client.enquiry.count({ where: { ...active, ownerUserId: null } }),
        client.enquiry.count({ where: { ...active, nextFollowUpAt: null } }),
        client.enquiry.count({
          where: { ...active, programmeSlug: { not: null } },
        }),
      ]);
    response = {
      ...response,
      agent: intent === 'briefing' ? 'main' : 'leads',
      text: choose(
        `ملخص الأكاديمية: ${total} طلباً نشطاً، ${overdue} متابعة متأخرة، ${unassigned} دون مسؤول، ${missing} دون خطة متابعة، و${courseLeads} مرتبطاً ببرنامج. الأولوية: راجع المتابعات المتأخرة ثم عيّن مسؤولاً للطلبات غير المسندة. اختر طلباً أدناه لتحضير مسودة وخطة للموافقة. الارتباط ببرنامج لا يثبت التسجيل أو الدفع.`,
        `Briefing : ${total} demandes actives, ${overdue} relances en retard, ${unassigned} sans responsable, ${missing} sans plan et ${courseLeads} liées à un programme. Priorité : traiter les retards puis attribuer les demandes. Choisissez une demande ci-dessous pour préparer un brouillon et un plan à approuver. Un intérêt pour un programme ne prouve ni inscription ni paiement.`,
        `Academy briefing: ${total} active enquiries, ${overdue} overdue follow-ups, ${unassigned} unassigned, ${missing} without a follow-up plan and ${courseLeads} linked to a programme. Review overdue work first, then assign owners. Select a lead below to prepare a draft and an approval request. Programme interest does not establish enrollment or payment.`,
      ),
      evidence: [evidence('CRM · Enquiry', '/enquiries')],
    };
  } else if (intent === 'faq') {
    const terms = museKnowledgeTerms(command.prompt);
    const isFettouma = /fettouma|فتومة|فطومة/i.test(command.prompt);
    const knowledge = terms.length
      ? await client.museKnowledge.findMany({
          where: {
            active: true,
            locale,
            ...(isFettouma
              ? { agent: 'fettouma' }
              : { agent: { not: 'revenue' } }),
            OR: terms.flatMap((term) => [
              { title: { contains: term, mode: 'insensitive' as const } },
              { content: { contains: term, mode: 'insensitive' as const } },
            ]),
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      : [];
    response.agent = isFettouma ? 'fettouma' : 'courses';
    response.text = knowledge.length
      ? knowledge
          .map(
            (item) =>
              `${item.title}\n${item.content}\n${choose('المصدر', 'Source', 'Source')}: ${item.source}`,
          )
          .join('\n\n')
      : choose(
          'لا توجد معرفة معتمدة مطابقة باللغة المختارة. أضف مرجعاً موثوقاً أدناه؛ لا يمكنني تأكيد الأسعار أو المواعيد دون مصدر.',
          'Aucune connaissance approuvée correspondante dans cette langue. Ajoutez une source vérifiée ci-dessous. Les prix et dates nécessitent une source.',
          'No matching approved knowledge in this language. Add a verified source below. Prices and dates require a source.',
        );
    response.evidence = knowledge.map((item) =>
      evidence(item.title, `knowledge:${item.id}`),
    );
  } else if (intent === 'revenue') {
    // Caller MUST enforce finance:manage; no revenue enters ordinary briefs or history lists.
    const totals = await client.invoice.groupBy({
      by: ['currency'],
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
        },
      },
      _sum: { totalMinor: true },
      _count: { id: true },
    });
    response.agent = 'revenue';
    response.text =
      choose(
        'فواتير مدفوعة هذا الشهر (UTC)، قبل خصم الاستردادات؛ ليست صافي الإيراد:',
        'Factures payées ce mois (UTC), avant remboursements ; ce n’est pas le revenu net :',
        'Paid invoices this month (UTC), before refunds; this is not net revenue:',
      ) +
      '\n' +
      (totals.length
        ? totals
            .map(
              (row) =>
                `${row.currency}: ${new Intl.NumberFormat(locale, { style: 'currency', currency: row.currency }).format((row._sum.totalMinor ?? 0) / 10 ** (new Intl.NumberFormat('en', { style: 'currency', currency: row.currency }).resolvedOptions().maximumFractionDigits ?? 2))} · ${row._count.id}`,
            )
            .join('\n')
        : choose(
            'لا توجد فواتير مدفوعة.',
            'Aucune facture payée.',
            'No paid invoices.',
          ));
    response.evidence = [evidence('Invoice · PAID · paidAt', '/finance')];
  } else if (intent === 'plan') {
    const tasks = await client.museTask.findMany({
      where: { actorId, done: false, agent: { not: 'revenue' } },
      orderBy: { dueAt: 'asc' },
      take: 10,
    });
    response.text =
      choose(
        'خطة عمل مقترحة: ١. راجع المتابعات المتأخرة. ٢. حضّر الردود للموافقة. ٣. تحقق من معرفة الدورات قبل الرد. أضف هدفاً ومهاماً بتاريخ أدناه.',
        'Plan proposé : 1. Revoir les relances en retard. 2. Préparer les réponses pour approbation. 3. Vérifier les sources des formations. Ajoutez un objectif et des tâches datées ci-dessous.',
        'Suggested plan: 1. Review overdue follow-ups. 2. Draft replies for approval. 3. Verify course sources before answering. Add a goal and dated tasks below.',
      ) +
      '\n' +
      tasks
        .map(
          (task) => `${task.dueAt.toISOString().slice(0, 10)} · ${task.title}`,
        )
        .join('\n');
    response.evidence = tasks.map((task) =>
      evidence(task.title, `task:${task.id}`),
    );
  } else if (intent === 'content') {
    const courses = await client.course.findMany({
      where: { published: true },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    });
    response.agent = 'content';
    response.text = courses.length
      ? courses
          .map((course, index) =>
            choose(
              `اليوم ${index + 1} — مسودة: اكتشف «${course.title}» مع أكاديمية لومينول. تواصل مع الفريق لمعرفة التفاصيل وشروط التسجيل. #LuminolAcademy`,
              `Jour ${index + 1} — Brouillon : Découvrez « ${course.title} » avec Luminol Academy. Contactez l’équipe pour les détails et conditions d’inscription. #LuminolAcademy`,
              `Day ${index + 1} — Draft: Discover “${course.title}” with Luminol Academy. Contact the team for details and registration requirements. #LuminolAcademy`,
            ),
          )
          .join('\n\n')
      : choose(
          'لا توجد دورات منشورة لتحضير محتوى موثق.',
          'Aucune formation publiée pour préparer un contenu sourcé.',
          'No published courses available for grounded content drafts.',
        );
    response.text +=
      '\n\n' +
      choose(
        'هذه مسودات للمراجعة. افتح تقويم المحتوى لحفظها واعتمادها قبل النشر.',
        'Brouillons à réviser. Ouvrez le calendrier pour les enregistrer et les approuver avant publication.',
        'Drafts for review. Open the content calendar to save and approve before publication.',
      );
    response.evidence = courses.map((course) =>
      evidence(course.title, `course:${course.id}`),
    );
  } else {
    response.agent = intent === 'booking' ? 'booking' : 'content';
    response.text =
      intent === 'booking'
        ? choose(
            'مصدر الحجوزات غير متصل بعد. لا أستطيع تأكيد مواعيد أو استشارات. أضف مصدراً معتمداً أو راجع فريق الحجز؛ يمكن حفظ تذكير أدناه.',
            'La source des rendez-vous n’est pas connectée. Je ne peux pas confirmer de créneaux. Consultez l’équipe et ajoutez un rappel ci-dessous.',
            'Booking data is not connected. I cannot confirm appointments or availability. Check with the booking team and save a reminder below.',
          )
        : choose(
            'إحصاءات Meta غير متصلة بهذا المركز. افتح تحليلات الأكاديمية للبيانات الداخلية. يلزم حساب وصلاحيات قراءة معتمدة لتحليل Facebook وInstagram.',
            'Les statistiques Meta ne sont pas connectées. Les analyses internes sont disponibles. Un compte et des autorisations de lecture sont nécessaires pour Facebook et Instagram.',
            'Meta insights are not connected to this center. Internal academy analytics are available. Facebook and Instagram analysis requires an authorized account and read scopes.',
          );
  }
  try {
    return await client.$transaction(async (tx) => {
      const run = await tx.museRun.create({
        data: {
          requestId: command.requestId,
          actorId,
          agent: response.agent,
          intent,
          prompt: command.prompt,
          response: response as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.museEvent.create({
        data: { actorId, kind: 'COMMAND_COMPLETED', reference: run.id },
      });
      return run;
    });
  } catch (error) {
    if (!(
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ))
      throw error;
    const run = await client.museRun.findUniqueOrThrow({
      where: { requestId: command.requestId },
    });
    if (
      run.actorId !== actorId ||
      run.prompt !== command.prompt ||
      run.intent !== intent
    )
      throw new Error('MUSE_REQUEST_CONFLICT', { cause: error });
    return run;
  }
}
