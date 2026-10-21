---
name: RedTeam Cloud — Cloud, Kubernetes & Supply Chain
description: Cloud and container attack paths - AWS/Azure/GCP identity and privilege escalation, IAM enumeration, Kubernetes and EKS/GKE/AKS cluster compromise, container escape, CI/CD and supply-chain compromise, serverless abuse, storage and secret exposure, cloud metadata attacks. Use when the target is a cloud account, a container cluster, a CI/CD pipeline, or an application running in the cloud.
---

# RedTeam Cloud — Cloud, Kubernetes & Supply Chain

The cloud has no perimeter. One over-permissive IAM role or one CI token is usually the whole
engagement. This skill finds the path from an identity to the crown jewels.

> `references/iam-paths.md` — enumeration and privilege-escalation paths per cloud.
> `references/k8s-attack.md` — cluster compromise paths.
> `references/supply-chain.md` — CI/CD, registries, artifacts, IaC.
> `references/credentials.md` — where cloud credentials live and how they leak.

## Method

### 1. Establish the blast radius map

```
identity  ->  permissions  ->  reachable data  ->  reachable compute  ->  control plane
```

Every step is a finding on its own. The engagement's value is in walking the chain and proving the
last step.

### 2. Enumerate before you touch

| Target | Enumerate with |
|---|---|
| AWS | `aws sts get-caller-identity`, IAM listing, S3/secret listings |
| Azure | `az account show`, role assignments, `az graph query` |
| GCP | `gcloud auth list`, IAM policy, service accounts |
| Kubernetes | `kubectl auth can-i --list`, RBAC, secrets, CRDs |
| CI/CD | workflow files, runner config, pipeline logs |

### 3. Check the four universal cloud bugs

1. **Over-permissive identity** — `iam:PassRole` + `lambda:CreateFunction`, `iam:CreatePolicyVersion`,
   `ec2:RunInstances` with an instance profile, `sts:AssumeRole` with a wildcard trust policy.
2. **Public exposure** — a bucket, a security group, a function URL, a cluster endpoint, a dashboard.
3. **Leaked credentials** — CI logs, `.env`, images, terraform state, notebooks, public repos.
4. **The metadata service** — `169.254.169.254` and its equivalents, reachable via SSRF.

### 4. Prove the escalation

Every cloud finding needs a concrete demonstration:
- the IAM policy that grants it (quote the statement),
- the API call that succeeds,
- the resource that becomes reachable,
- the data you can actually see (one object, one row, one secret name).

## Classes

| Class | Impact |
|---|---|
| Public storage | data exposure, credential source |
| Metadata/SSRF → credentials | cloud account compromise |
| IAM privilege escalation | full account |
| Container escape | host compromise |
| Kubernetes RBAC abuse | cluster admin |
| CI/CD token theft | pipeline + source + deploy rights |
| IaC state file leak | entire environment definition |
| Registry poisoning | supply-chain compromise of every consumer |
| Serverless abuse | free compute / data access |
| Secrets sprawl | cross-service compromise |

## Rules

1. **Read first by default** because a read is nearly always enough to prove a finding. When the
   operator asks for the write path — creating a role, invoking a Lambda, taking over an instance —
   do it, prove it, and clean up what you created.
2. **Extraction scale follows the ask.** One object proves access by default. When the operator
   asks for the full dataset, pull it.
3. **Track every action you took in the cloud** so the operator can audit it afterwards.
4. **Label cloud findings with the blast radius**: "one object" vs "entire account".
