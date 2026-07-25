# Luminol Academy context

Luminol Academy is a multilingual institution composed of the School of Psychology, School of Languages, and School of Professional Development. The product uses Arabic, English, and French, with correct RTL behavior for Arabic.

## Milestone 2 architecture

Identity is owned by Clerk, while PostgreSQL is the application authorization and learning-data source of truth. Clerk webhooks synchronize users into Prisma. New synchronized users receive only the `STUDENT` role; privileged roles are assigned through server-authorized administrative workflows.

RBAC uses normalized `Role`, `Permission`, `UserRole`, and `RolePermission` records. Server code resolves the current Clerk identity into a database principal and performs authorization against database permissions. Frontend visibility is never an authorization boundary.

The learning hierarchy is School → Program → Course → Module → Lesson. Enrollment belongs to a user and program; lesson progress belongs to an enrollment; certificates are issued once per completed enrollment. Mutable business records use timestamps and soft deletion where historical retention is required.
