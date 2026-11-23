# Luminol Academy documentation

**English** · [العربية](ar/README.md)

This index lists every document in the repository, grouped by purpose. Guides marked **AR** also have an Arabic version in [`docs/ar`](ar/README.md). Milestone records are kept in English as the historical delivery log.

## Start here

| Document                                         | What it covers                                                   |     |
| ------------------------------------------------ | ---------------------------------------------------------------- | --- |
| [Repository README](../README.md)                | Overview, setup, commands and quality gates                      | AR  |
| [Architecture](ARCHITECTURE.md)                  | Applications, shared packages, data flow, security and testing   | AR  |
| [Configuration and deployment](CONFIGURATION.md) | Every environment variable, Vercel projects and the release flow | AR  |
| [Public website](PUBLIC_WEBSITE.md)              | Routes, features, localization, media rules and academy facts    | AR  |
| [Public site review](PUBLIC_SITE_REVIEW.md)      | Annotated screenshots of consultation and programme journeys     | AR  |
| [Engineering rules](../AGENTS.md)                | Mandatory conventions for every change                           |     |
| [Handoff](HANDOFF.md)                            | Current state, next actions and what is waiting on the academy   |     |

## Product and planning

| Document                              | What it covers                                     |
| ------------------------------------- | -------------------------------------------------- |
| [Project context](LUMINOL_CONTEXT.md) | Mission, schools, audiences and product principles |
| [Master roadmap](MASTER_ROADMAP.md)   | Canonical delivery sequence                        |
| [Project status](PROJECT_STATUS.md)   | Current repository and operational state           |

## Design

| Document                                          | What it covers                                   |
| ------------------------------------------------- | ------------------------------------------------ |
| [Design system](design-system.md)                 | Tokens, typography, components and accessibility |
| [Design rationale](DESIGN_RATIONALE.md)           | The "knowledge that glows" visual direction      |
| [Cinematic public-site media](cinematic-media.md) | Film, photography and commissioned artwork       |
| [Cinematic refinement](cinematic-refinement.md)   | September 2026 refinement direction              |

## Engineering

| Document                                                    | What it covers                                    |
| ----------------------------------------------------------- | ------------------------------------------------- |
| [CMS operations](cms.md)                                    | Sanity setup, publishing rules and fallbacks      |
| [Vercel deployment selection](deployments.md)               | Ignored-build rules for the three Vercel projects |
| [Prisma 7 migration](PRISMA_7_MIGRATION.md)                 | ORM upgrade notes                                 |
| [Sanity Studio v6 migration](SANITY_STUDIO_V6_MIGRATION.md) | Studio upgrade notes                              |
| [Learning analytics](LEARNING_ANALYTICS.md)                 | Learning and outcome views and their boundaries   |
| [Public enquiry readiness](public-enquiry-readiness.md)     | Shorter enquiry paths and their rules             |

## Operations and security

| Document                                                          | What it covers                                    |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| [Post-launch operations](POST_LAUNCH_OPERATIONS.md)               | Production runbook and scheduled checks           |
| [Security and launch readiness](SECURITY_AND_LAUNCH_READINESS.md) | Security audit and controlled-launch runbook      |
| [Academy operations guide (M21)](MILESTONE_21_OPERATIONS.md)      | Roles and boundaries in the operations workspaces |
| [CRM sections operator guide (M23)](MILESTONE_23_OPERATIONS.md)   | Sections, offers, opportunities and dashboard     |

## Milestone records

| Document                                                                         | Milestone |
| -------------------------------------------------------------------------------- | --------- |
| [Security audit and production launch](MILESTONE_13_SECURITY_LAUNCH_PLAN.md)     | 13        |
| [Search and discovery final validation](MILESTONE_14_FINAL_VALIDATION.md)        | 14        |
| [Public localization validation](milestone-15-public-localization-validation.md) | 15        |
| [Integration boundaries](MILESTONE_16_INTEGRATION_BOUNDARIES.md)                 | 16        |

## Writing documentation

- Write in clear, plain English, in the present tense and active voice. Arabic versions use Modern Standard Arabic.
- Keep identifiers, commands, paths and environment variable names in `code` format and in English in both languages.
- When you change an **AR** guide, update its Arabic counterpart in the same pull request.
- Never include secrets, client data or personal details of learners in documentation or screenshots.
