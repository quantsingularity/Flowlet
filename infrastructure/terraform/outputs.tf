output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.networking.private_subnet_ids
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = module.security.database_security_group_id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = module.security.redis_security_group_id
}

output "eks_security_group_id" {
  description = "ID of the EKS security group"
  value       = module.security.eks_security_group_id
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.db_instance_endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = module.database.db_instance_port
}

output "database_name" {
  description = "Database name"
  value       = module.database.db_instance_name
}

output "database_username" {
  description = "Database username"
  value       = module.database.db_instance_username
  sensitive   = true
}

output "database_password_secret_arn" {
  description = "ARN of the secret containing the database password"
  value       = aws_secretsmanager_secret.db_password.arn
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.redis.redis_endpoint
  sensitive   = true
}

output "redis_port" {
  description = "Redis cluster port"
  value       = module.redis.redis_port
}

output "redis_auth_token" {
  description = "Redis authentication token"
  value       = random_password.redis_auth_token.result
  sensitive   = true
}

output "app_assets_bucket_id" {
  description = "S3 bucket ID for application assets"
  value       = module.s3.s3_bucket_id
}

output "app_assets_bucket_arn" {
  description = "S3 bucket ARN for application assets"
  value       = module.s3.s3_bucket_arn
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}
