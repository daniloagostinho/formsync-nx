# SSM Parameters para armazenar outputs do Terraform
resource "aws_ssm_parameter" "s3_bucket_name" {
  name  = "/formsync/s3-bucket-name"
  type  = "String"
  value = aws_s3_bucket.formsync_frontend.bucket

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-s3-bucket-name"
  })
}

resource "aws_ssm_parameter" "cloudfront_url" {
  name  = "/formsync/cloudfront-url"
  type  = "String"
  value = "https://${aws_cloudfront_distribution.formsync_frontend.domain_name}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-cloudfront-url"
  })
}

resource "aws_ssm_parameter" "cloudfront_distribution_id" {
  name  = "/formsync/cloudfront-distribution-id"
  type  = "String"
  value = aws_cloudfront_distribution.formsync_frontend.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-cloudfront-distribution-id"
  })
}

resource "aws_ssm_parameter" "alb_url" {
  name  = "/formsync/alb-url"
  type  = "String"
  value = "http://${aws_lb.formsync_backend.dns_name}"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-alb-url"
  })
}

resource "aws_ssm_parameter" "ecs_cluster_name" {
  name  = "/formsync/ecs-cluster-name"
  type  = "String"
  value = aws_ecs_cluster.formsync_backend.name

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-cluster-name"
  })
}

resource "aws_ssm_parameter" "ecs_service_name" {
  name  = "/formsync/ecs-service-name"
  type  = "String"
  value = aws_ecs_service.formsync_backend.name

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-service-name"
  })
}
