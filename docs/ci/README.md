# CI workflow — one step needed to activate

`ci.yml` in this directory is a complete, working GitHub Actions workflow. It
runs typecheck, unit tests, build and a formatting check on every push and pull
request to `main`.

It is parked here rather than in `.github/workflows/` because the GitHub token
in use when this repo was created did not carry the `workflow` OAuth scope, and
GitHub refuses pushes that add or change workflow files without it.

## Activating it

Run this once, from the repository root:

```bash
gh auth refresh -s workflow
```

Then move the file into place and push:

```bash
mkdir -p .github/workflows && git mv docs/ci/ci.yml .github/workflows/ci.yml && git rm -q docs/ci/README.md && git commit -m "ci: enable GitHub Actions workflow" && git push
```

Actions will run on the next pull request. Nothing else needs changing — the
workflow already targets the right Node and pnpm versions and uses
`pnpm install --frozen-lockfile`.

## Recommended branch protection

Once CI is running, protect `main` (Settings → Branches → Add rule):

- Require a pull request before merging
- Require status checks to pass: `Typecheck · Test · Build` and `Formatting`
- Require branches to be up to date before merging
