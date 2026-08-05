# Learner portal deployment

This application maps to the `luminol-academy-portal` Vercel project.

Changes in this directory must build the learner portal preview. They must not
rebuild the public website or administration application unless the same Git
comparison also changes one of their shared dependencies.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
