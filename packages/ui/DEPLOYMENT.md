# Shared UI deployment impact

`@luminol/ui` is used by the public website, learner portal and administration
application. Changes in this package must therefore build previews for all
three Vercel projects.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
