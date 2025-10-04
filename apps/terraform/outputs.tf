output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

# Private subnets removidos para economizar
# output "private_subnet_ids" {
#   description = "IDs of the private subnets"
#   value       = aws_subnet.private[*].id
# }

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

# NAT Gateways removidos para economizar
# output "nat_gateway_ids" {
#   description = "IDs of the NAT Gateways"
#   value       = aws_nat_gateway.main[*].id
# }

# S3 and CloudFront outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket for frontend"
  value       = aws_s3_bucket.formsync_frontend.bucket
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.formsync_frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.formsync_frontend.id
}

# API Gateway outputs
output "api_url" {
  description = "API Gateway URL for backend"
  value       = "https://${aws_api_gateway_rest_api.formsync_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.formsync_api.stage_name}"
}

# ALB outputs - COMENTADO PARA ECONOMIA
# output "alb_dns_name" {
#   description = "DNS name of the Application Load Balancer"
#   value       = aws_lb.formsync_backend.dns_name
# }

# ECS outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.formsync_backend.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.formsync_backend.name
}

# ECR outputs
output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.formsync_backend.repository_url
}

# Database outputs
output "database_endpoint" {
  description = "RDS cluster endpoint"
  value       = aws_rds_cluster.formsync_db.endpoint
}

output "database_name" {
  description = "Database name"
  value       = aws_rds_cluster.formsync_db.database_name
}
