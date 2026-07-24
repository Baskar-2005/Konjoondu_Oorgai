---
name: Artifact workflow ownership
description: Port ownership and workflow cleanup for imported multi-artifact projects
---

Artifact-managed services should be the sole workflows listening on their configured frontend and API ports. Legacy top-level workflows that launch the same commands can collide with them and fail with `EADDRINUSE` during startup.

**Why:** Imported projects may retain older `Frontend`, `Backend API`, or parent `Project` workflow entries alongside generated artifact workflows.

**How to apply:** When an artifact fails with an address-in-use error, inspect all configured workflows, stop duplicate services, remove obsolete duplicate entries, and verify the artifact workflows and proxy endpoints afterward.