output "db_instance_address" {
  description = "The address of the RDS instance."
  value       = aws_db_instance.default.address
}

output "db_instance_endpoint" {
  description = "The connection endpoint of the RDS instance."
  value       = aws_db_instance.default.endpoint
}

output "db_instance_port" {
  description = "The port of the RDS instance."
  value       = aws_db_instance.default.port
}

output "db_instance_arn" {
  description = "The ARN of the RDS instance."
  value       = aws_db_instance.default.arn
}

output "db_instance_name" {
  description = "The name of the database."
  value       = aws_db_instance.default.db_name
}

output "db_instance_username" {
  description = "The master username for the database."
  value       = aws_db_instance.default.username
  sensitive   = true
}
