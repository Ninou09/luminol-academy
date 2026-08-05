# Public website deployment

This application maps to the `luminol-academy-web` Vercel project.

Changes in this directory must build the public website preview. They must not
rebuild the learner portal or administration application unless the same Git
comparison also changes one of their shared dependencies.

The repository package manager and all deployment installs must remain pinned
to pnpm `10.34.5` or a later patched 10.x release allowed by the root engine
constraint. Vercel, CI and production workflows must use a frozen lockfile and
must not introduce checksum-repair retries.

Vercel's Hobby build-rate gate is evaluated before the ignored-build command.
When that team-level gate is active, even a project that would later be skipped
can receive a failed status without cloning the repository or executing the
classifier. Do not create empty commits to retry this condition. Record the
external blocker and wait for the allowance to reset, or use an independently
reviewed equivalent verification path that checks out the exact commit, runs a
frozen install, builds the production application and exercises it through a
public browser route.

See `../../docs/deployments.md` for the complete dependency matrix, ignored
build rules and rollback procedure.
