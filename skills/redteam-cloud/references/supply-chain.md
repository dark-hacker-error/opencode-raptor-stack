# CI/CD, Registry & Supply-Chain Compromise

The pipeline is the most privileged thing you will ever find, because it holds the source, the
signing keys, and the deploy rights.

## Find the pipeline

| Platform | Where |
|---|---|
| GitHub Actions | `.github/workflows/*.yml` |
| GitLab CI | `.gitlab-ci.yml` |
| Jenkins | `Jenkinsfile`, `/script`, `/credentials` |
| CircleCI | `.circleci/config.yml` |
| Travis | `.travis.yml` |
| Azure Pipelines | `azure-pipelines.yml` |
| Argo CD | `argocd` CRDs, the API server |
| Flux | `flux-system` namespace |
| Tekton | `tekton.dev` namespaces |

## What to read in a workflow file

```yaml
on: [push]
permissions: {contents: write, id-token: write, packages: write}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4          # unpinned tag -> supply chain risk
      - run: make release
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCT:role/Deploy
```

Flag:
- **`permissions:` absent** → the token gets the repo default (often write).
- **`id-token: write`** → the workflow can request an OIDC cloud token → cloud compromise.
- **`pull_request_target`** → runs with write tokens on fork PRs → classic CI pwn.
- **Unpinned actions** (`@v4` instead of a commit SHA) → upstream can take over your pipeline.
- **Secrets echoed into logs** → `set -x`, `echo $TOKEN`, or a failing command printing the env.
- **Self-hosted runners** → the runner's host becomes the target.
- **Artifacts built without provenance** → a consumer cannot verify what it got.

## OIDC to cloud — the modern CI→cloud chain

```yaml
permissions:
  id-token: write
steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with: {role-to-assume: arn:aws:iam::ACCT:role/CIRole}
```

If the cloud trust policy is loose (`repo:ORG/*` or no `sub` condition), a workflow in a fork can
assume the role.

```bash
# check the trust policy
aws iam get-role --role-name CIRole --query 'Role.AssumeRolePolicyDocument'
```

The same pattern exists for GCP (`google-github-actions/auth` + `WIF`) and Azure (OIDC issuer).

## GitHub Actions abuse patterns

| Pattern | Effect |
|---|---|
| `pull_request_target` + `checkout` of the PR head | arbitrary code with repo secrets |
| Cache poisoning (`actions/cache` with a shared key) | inject into other workflows |
| `GITHUB_TOKEN` in a fork PR | no — but `pull_request_target` has it |
| Composite actions from a fork | code execution in the workflow |
| Artifacts uploaded from a fork and consumed by a trusted workflow | build-time compromise |
| `workflow_run` triggered by an untrusted workflow | privilege escalation between workflows |

```bash
# audit for dangerous triggers
grep -rn "pull_request_target\|workflow_run\|id-token: write" .github/workflows/
```

## Registry compromise

| Registry | Attack |
|---|---|
| Docker Hub | push a poisoned image with a similar name |
| GHCR | push to a package the deploy pipeline trusts |
| ECR / ACR / GCR | push to a repo the cluster pulls from |
| npm / PyPI | typosquat, or publish a patched version with a backdoor |
| Maven / Go modules | replace a dependency version |

```bash
# what does the deploy pull?
kubectl get pods -A -o json | jq -r '.items[].spec.containers[].image'
# is the tag mutable?
docker inspect <image> --format '{{index .RepoDigests 0}}'
```

An image referenced by a mutable tag (`app:latest`) is a supply-chain finding on its own.

## Artifact and provenance

```bash
cosign verify <image> --key cosign.pub
cosign attest ls <image>
slsa-verifier verify-artifact <artifact> --provenance-path prov.json
```

Missing signature / provenance / SBOM = a finding, and often a compliance one.

## IaC as the source of truth

```bash
terraform show -json tfstate > state.json     # secrets live in state
jq '.resources[] | select(.type=="aws_s3_bucket")' state.json
```

Terraform state files contain **plaintext** secrets — database passwords, private keys, tokens. A
readable state file is a critical finding, and it is the fastest path to cloud access.

## Dependency and build compromise

| Vector | Check |
|---|---|
| typosquat in requirements/package.json | `pip-audit`, `npm audit`, `osv-scanner` |
| install scripts running arbitrary code | `npm ci --ignore-scripts`, review `postinstall` |
| unpinned git dependencies | a mutable branch can change under you |
| compromised maintainer | lockfile diff against the previous release |
| build script fetching from the internet | `curl … \| bash` in a Makefile |
| Docker base image not pinned by digest | tag can be re-pushed |

```bash
osv-scanner --recursive . --format json
trufflehog filesystem . --only-verified
semgrep --config=p/supply-chain .
```

## The pipeline-pivot checklist

1. Read every workflow file.
2. List every secret the pipeline uses and what it can reach.
3. Check the cloud trust policies.
4. Check the runner isolation (ephemeral? hosted? on a production subnet?).
5. Check what the pipeline deploys and from where the artifacts come.
6. Check the registry for mutable tags and unsigned images.

A single compromised pipeline can beat every other control in the environment — report it as such.
