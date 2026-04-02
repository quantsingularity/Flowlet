#!/bin/bash

set -e

echo "🧹 Starting Flowlet Infrastructure Cleanup"

delete_k8s_file() {
    local file=$1
    echo "Attempting to delete resources from $file..."
    kubectl delete -f "$file" --ignore-not-found=true --timeout=120s || true
    echo "✅ Processed $file"
}

delete_resource() {
    local resource_type=$1
    local name=$2
    local namespace=$3

    if [ -n "$namespace" ]; then
        echo "Attempting to delete $resource_type/$name in namespace $namespace..."
        kubectl delete "$resource_type" "$name" -n "$namespace" --ignore-not-found=true --timeout=120s || true
    else
        echo "Attempting to delete $resource_type/$name..."
        kubectl delete "$resource_type" "$name" --ignore-not-found=true --timeout=120s || true
    fi
    echo "✅ Processed $resource_type/$name"
}

echo "⚙️ Uninstalling Istio..."
istioctl uninstall --purge -y --timeout 120s || true
kubectl label namespace flowlet-core istio-injection- || true
kubectl label namespace flowlet-data istio-injection- || true
kubectl label namespace flowlet-messaging istio-injection- || true
kubectl label namespace flowlet-monitoring istio-injection- || true

echo "🌍 Removing ingress and network policies..."
delete_k8s_file kubernetes/ingress/ingress.yaml

echo "🔒 Removing security policies and external secrets..."
delete_resource externalsecret flowlet-tls-secrets flowlet-security
delete_resource externalsecret flowlet-api-keys flowlet-security
delete_resource externalsecret flowlet-oauth-secrets flowlet-security
delete_resource secretstore vault-secret-store flowlet-security
delete_k8s_file kubernetes/security/security-policies.yaml

echo "📊 Removing monitoring components..."
delete_k8s_file kubernetes/monitoring/grafana.yaml
delete_k8s_file kubernetes/monitoring/prometheus.yaml

echo "🔧 Removing core services..."
delete_k8s_file kubernetes/services/ai-chatbot.yaml
delete_k8s_file kubernetes/services/ai-fraud-detection.yaml
delete_k8s_file kubernetes/services/notification-service.yaml
delete_k8s_file kubernetes/services/developer-portal.yaml
delete_k8s_file kubernetes/services/api-gateway.yaml
delete_k8s_file kubernetes/services/ledger-service.yaml
delete_k8s_file kubernetes/services/kyc-aml-service.yaml
delete_k8s_file kubernetes/services/card-service.yaml
delete_k8s_file kubernetes/services/payments-service.yaml
delete_k8s_file kubernetes/services/wallet-service.yaml
delete_k8s_file kubernetes/services/auth-service.yaml

echo "📨 Removing messaging systems..."
delete_k8s_file kubernetes/messaging/rabbitmq.yaml
delete_k8s_file kubernetes/messaging/kafka.yaml

echo "🗄️  Removing databases..."
delete_k8s_file kubernetes/databases/influxdb.yaml
delete_k8s_file kubernetes/databases/redis.yaml
delete_k8s_file kubernetes/databases/mongodb.yaml
delete_k8s_file kubernetes/databases/postgresql.yaml

echo "📁 Removing namespaces..."
delete_resource namespace flowlet-security
delete_resource namespace flowlet-monitoring
delete_resource namespace flowlet-messaging
delete_resource namespace flowlet-data
delete_resource namespace flowlet-core

echo ""
echo "🎉 Flowlet Infrastructure cleanup complete!"
echo ""
echo "⚠️  Note: Persistent volumes and associated data may still exist and need manual cleanup."
echo "   Run: kubectl get pv to check for remaining persistent volumes"
