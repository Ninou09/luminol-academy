# Administration deployment

This application maps to the `luminol-academy-admin` Vercel project.

Changes in this directory must build the administration preview. They must not
rebuild the public website or learner portal unless the same Git comparison
also changes one of their shared dependencies.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
