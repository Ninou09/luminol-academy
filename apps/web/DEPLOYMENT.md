# Public website deployment

This application maps to the `luminol-academy-web` Vercel project.

Changes in this directory must build the public website preview. They must not
rebuild the learner portal or administration application unless the same Git
comparison also changes one of their shared dependencies.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
