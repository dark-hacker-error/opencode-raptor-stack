# Where Cloud Credentials Live & How They Leak

## The places

| Location | Typical credential | Leak vector |
|---|---|---|
| `/var/run/secrets/kubernetes.io/serviceaccount/token` | k8s SA token | any pod, any SSRF |
| `~/.aws/credentials` | AWS keys | home dir, world-readable files, container images |
| `~/.azure/` | Azure CLI tokens | same |
| `~/.config/gcloud/` | GCP creds | same |
| `/proc/<pid>/environ` | env vars of any process | procfs, container escape, SSRF |
| `/proc/self/cgroup` + `mountinfo` | container context | fingerprinting |
| Terraform state | **plaintext** DB passwords, private keys | state file in S3/Git |
| `.env`, `docker-compose.yml` | app secrets | committed repo, image layers |
| CI logs | tokens printed by a failing step | log retention |
| Docker image layers | build-time `ARG`/`ENV` secrets | `docker history`, `docker save` |
| Notebook outputs | keys pasted into a cell | public notebook |
| Kubernetes Secrets (base64) | everything | RBAC, etcd |
| Jenkins credentials.xml / GitHub Actions secrets | deploy keys | admin access, plaintext in config |
| Backup files, `.bak`, `.old` | everything | content discovery |
| `.git` directory | deleted secrets still in history | exposed repo |
| Frontend JS bundles | public API keys | everyone |
| APK/IPA resources | embedded keys | reverse engineering |
| PDF metadata / Office documents | authors, sometimes keys | metadata extraction |

## Hunt commands

```bash
# filesystem
grep -rInE '(AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|aws_secret_access_key|AIza[0-9A-Za-z_-]{35}|xox[baprs]-[A-Za-z0-9-]{10,}|gh[pousr]_[A-Za-z0-9]{36,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)' / 2>/dev/null | head -50

# dedicated scanners
trufflehog filesystem /path --only-verified
gitleaks detect -s /path --no-git -v
semgrep --config=p/secrets --config=p/gitleaks .

# containers
docker history --no-trunc <image> | grep -iE 'secret|password|key'
docker save <image> | grep -aiE 'AKIA[0-9A-Z]{16}'

# terraform
terraform show -json 2>/dev/null | jq '.resources[] | select(.type|test("password|secret|key"))'

# k8s
kubectl get secrets -A -o json | jq -r '.items[] | .data | to_entries[] | "\(.key)=\(.value|@base64d)"'

# git history
git log -p --all | grep -iE 'password|secret|api[_-]?key|token' | head -50
```

## The metadata service (SSRF → cloud)

Every major cloud exposes instance metadata. Reach it from anywhere the app can make requests.

| Cloud | URL | Header |
|---|---|---|
| AWS (IMDSv2) | `http://169.254.169.254/latest/api/token` | `X-aws-ec2-metadata-token-ttl-seconds: 21600` then `X-aws-ec2-metadata-token: <t>` |
| AWS (IMDSv1) | `http://169.254.169.254/latest/meta-data/iam/security-credentials/` | none |
| GCP | `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token` | `Metadata-Flavor: Google` |
| Azure | `http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/` | `Metadata: true` |
| Alibaba | `http://100.100.100.200/latest/meta-data/ram/security-credentials/` | none |
| DigitalOcean | `http://169.254.169.254/metadata/v1.json` | none |

```bash
# AWS IMDSv2
TOK=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -s "http://169.254.169.254/latest/meta-data/iam/security-credentials/" -H "X-aws-ec2-metadata-token: $TOK"
```

**IMDSv1 disabled** is a real control — test it, and if it works, that is the finding. Hop 0 headers
(`X-Forwarded-For: 169.254.169.254`, `X-Original-URL`) do not work on IMDSv2 but sometimes defeat
application-layer blocks.

## Cloud-specific credential files

```bash
~/.aws/credentials            ~/.aws/config
~/.azure/msal_token_cache.json ~/.azure/azureProfile.json
~/.config/gcloud/credentials.db ~/.config/gcloud/application_default_credentials.json
~/.kube/config                # contains cluster certs + tokens
~/.docker/config.json         # registry auth
~/.git-credentials            # https creds
~/.netrc                      # ftp/http creds
~/.npmrc ~/.pypirc ~/.cargo/credentials
```

## Turning a leak into access

| Leak | Use |
|---|---|
| AWS access key + secret | `aws sts get-caller-identity` → enumerate |
| GCP service-account JSON | `gcloud auth activate-service-account --key-file` |
| Azure client id + secret | `az login --service-principal -u <id> -p <secret> --tenant <t>` |
| k8s kubeconfig | `kubectl --kubeconfig=<file> get secrets -A` |
| DB password from a state file | connect, and look for more |
| GitHub PAT | clone private repos, read org secrets |
| npm token | publish a package (supply chain) |
| SSH private key | log in as that user |
| JWT | decode, look for `sub`, `scope`, `iss` |

## Reporting

```
CREDENTIAL: <what kind, where found, which account>
PROOF:       <the identity call that confirmed it>
BLAST:       <what that account can reach>
CHAIN:       <what it unlocked next>
```
Always report the **location** of the leak (repo / image / bucket / pod / log) — that is what the
operator has to fix.
