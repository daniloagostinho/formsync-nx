# Backend OTIMIZADO para custos - API Gateway + Lambda (sem ECS/ALB)

# Lambda Function para backend
resource "aws_lambda_function" "formsync_backend" {
  function_name = "${var.project_name}-backend"
  role         = aws_iam_role.lambda_role.arn
  handler      = "index.handler"
  runtime      = "java17"
  filename     = "backend-lambda.zip"
  
  # Configurações otimizadas para custo
  memory_size = 256
  timeout     = 30
  
  environment {
    variables = {
      DATABASE_URL = "jdbc:postgresql://${aws_rds_cluster.formsync_db.endpoint}/${aws_rds_cluster.formsync_db.database_name}"
      DB_USERNAME  = aws_rds_cluster.formsync_db.master_username
      DB_PASSWORD  = aws_rds_cluster.formsync_db.master_password
      SPRING_PROFILES_ACTIVE = "prod"
    }
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-lambda"
  })
}

# IAM Role para Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-lambda-role"
  })
}

# Attach basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Attach VPC access policy
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Lambda Permission para API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.formsync_backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.formsync_api.execution_arn}/*/*"
}

# API Gateway Integration para Lambda
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_method.api_proxy.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.formsync_backend.invoke_arn
}



