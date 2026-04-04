#!/bin/bash

# Flowlet Infrastructure Deployment Script

set -euo pipefail

echo "🚀 Starting Flowlet Infrastructure Deployment"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 first."
        exit 1
    fi
}

check_command kubectl
check_command helm
check_command istioctl

if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

apply_manifest() {
    local file=$1
    local retries=5
    local count=0
    while [ $count -lt $retries ]; do
        if kubectl apply -f "$file"; then
            echo "✅ Applied $file"
            return 0
        else
            count=$((count + 1))
            echo "⚠️  Failed to apply $file (attempt $count/$retries)"
            [ $count -lt $retries ] && sleep 10
        fi
    done
    echo "❌ Failed to apply $file after $retries attempts"
    return 1
}

# Fixed: wait_for_resource now correctly handles label selectors
wait_for_resource() {
    local resource_type=$1
    local label_selector=$2
    local namespace=$3
    local timeout=${4:-300}

    echo "⏳ Waiting for $resource_type with selector '$label_selector' in namespace $namespace..."

    local deadline=$(($(date +%s) + timeout))
    while [ "$(date +%s)" -lt "$deadline" ]; do
        local ready
        ready=$(kubectl get "$resource_type" -n "$namespace" -l "$label_selector" \
            --no-headers 2>/dev/null | grep -c "Running" || true)
        if [ "$ready" -gt 0 ]; then
            echo "✅ $resource_type ($label_selector) in $namespace is ready."
            return 0
        fi
        sleep 5
    done

    echo "❌ $resource_type ($label_selector) in $namespace did not become ready within ${timeout}s."
    kubectl get "$resource_type" -n "$namespace" -l "$label_selector" || true
    return 1
}

wait_for_deployment() {
    local name=$1
    local namespace=$2
    local timeout=${3:-300}
    echo "⏳ Waiting for deployment/$name in $namespace..."
    if ! kubectl rollout status deployment/"$name" -n "$namespace" --timeout="${timeout}s"; then
        echo "❌ deployment/$name in $namespace did not become ready within ${timeout}s."
        kubectl describe deployment "$name" -n "$namespace" || true
        return 1
    fi
    echo "✅ deployment/$name in $namespace is ready."
}

# 1. Namespaces
echo "📁 Creating namespaces..."
apply_manifest "kubernetes/namespaces/namespaces.yaml"

for ns in flowlet-core flowlet-data flowlet-messaging flowlet-monitoring flowlet-security; do
    until kubectl get namespace "$ns" &>/dev/null; do sleep 2; done
    echo "✅ Namespace $ns is ready."
done

# 2. Secrets (apply example if no real secrets exist)
echo "🔑 Applying secrets..."
if [ -f "kubernetes/secrets/secret.yaml" ]; then
    apply_manifest "kubernetes/secrets/secret.yaml"
else
    echo "⚠️  kubernetes/secrets/secret.yaml not found."
    echo "   Create it from secret.example.yaml with real values before deploying."
fi
apply_manifest "kubernetes/secrets/external-secret-store.yaml"

# 3. RBAC and security policies
echo "🔒 Deploying RBAC and security policies..."
apply_manifest "kubernetes/security/rbac.yaml"
apply_manifest "kubernetes/security/resource-quotas.yaml"
apply_manifest "kubernetes/security/network-policies.yaml"
apply_manifest "kubernetes/security/security-policies.yaml"
apply_manifest "kubernetes/security/pod-disruption-budgets.yaml"

# 4. Istio service mesh
echo "⚙️  Deploying Istio Service Mesh..."
istioctl install --set profile=default -y
for ns in flowlet-core flowlet-data flowlet-messaging flowlet-monitoring; do
    kubectl label namespace "$ns" istio-injection=enabled --overwrite
done

# 5. Databases
echo "🗄️  Deploying databases..."
apply_manifest "kubernetes/databases/postgresql.yaml"
apply_manifest "kubernetes/databases/mongodb.yaml"
apply_manifest "kubernetes/databases/redis.yaml"
apply_manifest "kubernetes/databases/influxdb.yaml"

wait_for_resource pods "app=postgresql" flowlet-data 300
wait_for_resource pods "app=mongodb"    flowlet-data 300
wait_for_resource pods "app=redis"      flowlet-data 300
wait_for_resource pods "app=influxdb"   flowlet-data 300

# 6. Messaging
echo "📨 Deploying messaging systems..."
apply_manifest "kubernetes/messaging/kafka.yaml"
apply_manifest "kubernetes/messaging/rabbitmq.yaml"

wait_for_resource pods "app=zookeeper" flowlet-messaging 300
wait_for_resource pods "app=kafka"     flowlet-messaging 300
wait_for_resource pods "app=rabbitmq"  flowlet-messaging 300

# 7. Core services
echo "🔧 Deploying core services..."
for svc in auth-service wallet-service payments-service card-service \
            kyc-aml-service ledger-service notification-service \
            ai-fraud-detection ai-chatbot; do
    apply_manifest "kubernetes/services/${svc}.yaml"
done

# 8. API Gateway and Developer Portal
echo "🌐 Deploying API Gateway and Developer Portal..."
apply_manifest "kubernetes/services/api-gateway.yaml"
apply_manifest "kubernetes/services/developer-portal.yaml"

# 9. Monitoring
echo "📊 Deploying monitoring..."
apply_manifest "kubernetes/monitoring/prometheus.yaml"
apply_manifest "kubernetes/monitoring/grafana.yaml"
apply_manifest "kubernetes/monitoring/alertmanager.yaml"

# 10. Autoscaling
echo "📈 Deploying autoscaling policies..."
apply_manifest "kubernetes/autoscaling/hpa.yaml"

# 11. Ingress
echo "🌍 Deploying ingress..."
apply_manifest "kubernetes/ingress/ingress.yaml"

# 12. Wait for critical deployments
echo "⏳ Waiting for critical services to be ready..."
wait_for_deployment auth-service     flowlet-core 300
wait_for_deployment wallet-service   flowlet-core 300
wait_for_deployment payments-service flowlet-core 300
wait_for_deployment api-gateway      flowlet-core 300

echo ""
echo "🎉 Flowlet Infrastructure Deployment Complete!"
echo ""
echo "📋 Deployment Summary:"
echo "  ✅ Namespaces created"
echo "  ✅ RBAC and security policies applied"
echo "  ✅ Istio service mesh deployed"
echo "  ✅ Databases: PostgreSQL, MongoDB, Redis, InfluxDB"
echo "  ✅ Messaging: Kafka, RabbitMQ"
echo "  ✅ Core Services: Auth, Wallet, Payments, Cards, KYC/AML, Ledger, Notifications"
echo "  ✅ AI Services: Fraud Detection, Chatbot"
echo "  ✅ Infrastructure: API Gateway, Developer Portal"
echo "  ✅ Monitoring: Prometheus, Grafana, Alertmanager"
echo "  ✅ Autoscaling: HPA policies"
echo ""
echo "🔗 Access Points:"
echo "  API Gateway:       kubectl get svc api-gateway -n flowlet-core"
echo "  Developer Portal:  kubectl get svc developer-portal -n flowlet-core"
echo "  Grafana:           kubectl get svc grafana -n flowlet-monitoring"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure external DNS for ingress domains"
echo "  2. Ensure Vault is configured for External Secrets"
echo "  3. Verify TLS certificates via cert-manager"
