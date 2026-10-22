# MaterialFluid source handoff

Run `npm run handoff` to create `MaterialFluid-v0.1.zip` with a single `MaterialFluid/` source directory. The command works with Node.js on Linux and Windows and requires no external archiver.

The archive includes source, tests, package lock, local fonts/icons, licenses, documentation, and both launchers. It excludes dependencies, caches, build outputs, test reports, review artifacts, Git metadata, local agent/cloud configuration, environment files, and existing archives. The generated archive contains a detailed exclusion manifest.

After extraction, run `npm ci`, then `./Open Showcase.sh` on Linux or `Open Showcase.cmd` on Windows. Node.js 22.12+ and npm are required. The first dependency installation needs network access; the showcase then serves its assets locally.
