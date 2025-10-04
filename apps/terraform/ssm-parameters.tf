# SSM Parameters para armazenar outputs do Terraform
resource "aws_ssm_parameter" "s3_bucket_name" {
  name      = "/formsync/s3-bucket-name"
  type      = "String"
  value     = aws_s3_bucket.formsync_frontend.bucket
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-s3-bucket-name"
  })
}

resource "aws_ssm_parameter" "cloudfront_url" {
  name      = "/formsync/cloudfront-url"
  type      = "String"
  value     = "https://${aws_cloudfront_distribution.formsync_frontend.domain_name}"
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-cloudfront-url"
  })
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name      = "/formsync/cloudfront-distribution-id"
  type      = "String"
  value     = aws_cloudfront_distribution.formsync_frontend.id
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-cloudfront-distribution-id"
  })
}

resource "aws_ssm_parameter" "api_url" {
  name      = "/formsync/api-url"
  type      = "String"
  value     = "https://${aws_api_gateway_rest_api.formsync_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.formsync_api.stage_name}"
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-api-url"
  })
}

# ECS parameters
resource "aws_ssm_parameter" "ecs_cluster_name" {
  name      = "/formsync/ecs-cluster-name"
  type      = "String"
  value     = aws_ecs_cluster.formsync_backend.name
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-cluster-name"
  })
}

resource "aws_ssm_parameter" "ecs_service_name" {
  name      = "/formsync/ecs-service-name"
  type      = "String"
  value     = aws_ecs_service.formsync_backend.name
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-service-name"
  })
}

resource "aws_ssm_parameter" "ecr_repository_url" {
  name      = "/formsync/ecr-repository-url"
  type      = "String"
  value     = aws_ecr_repository.formsync_backend.repository_url
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecr-repository-url"
  })
}

# Database parameters
resource "aws_ssm_parameter" "database_url" {
  name      = "/formsync/database-url"
  type      = "String"
  value     = "jdbc:postgresql://${aws_rds_cluster.formsync_db.endpoint}/${aws_rds_cluster.formsync_db.database_name}"
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-database-url"
  })
}

resource "aws_ssm_parameter" "db_username" {
  name      = "/formsync/db-username"
  type      = "String"
  value     = aws_rds_cluster.formsync_db.master_username
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-username"
  })
}

resource "aws_ssm_parameter" "db_password" {
  name      = "/formsync/db-password"
  type      = "SecureString"
  value     = var.db_password
  overwrite = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-password"
  })
}
