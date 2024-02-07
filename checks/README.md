# Checks

Checks are the steps that are run in CI (continuous integration).

Currently, there are three different phases of CI in the project:

1. A precommit hook.
1. A prepush hook.
1. GitHub Actions that run when a pull request is opened.

Checks are run dynamically from the scripts in this directory. If a script exists in this directory, it will be run
during one of the above phases of CI. If the script exits with a nonzero exit code, the CI phase will fail.

In each case, this means:

1. Precommit - the commit will fail. You can modify your staged files and then try again.
1. Prepush - the push will fail. You can add a commit or modify your existing ones, and then try again.
1. GitHub Actions - The action will fail. You can modify your branch locally and push it up to your GitHub remote to try again.

## Adding a new check

Placing a new script file in this directory will add a new check. The easiest way to get started is to copy the template:

```sh
cp checks/_template.sh checks/my-new-check.sh
```

The template includes comments for how the check must be structured.
