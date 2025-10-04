# Backend OTIMIZADO - API Gateway direto para Lambda (sem ALB/ECS)

# ECR Repository para backend
resource "aws_ecr_repository" "formsync_backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-ecr"
  })
}

# Application Load Balancer para backend
resource "aws_lb" "formsync_backend" {
  name               = "${var.project_name}-backend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  enable_deletion_protection = false
  
  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-alb"
  })
}

# Target Group para ECS
resource "aws_lb_target_group" "formsync_backend" {
  name        = "${var.project_name}-backend-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/actuator/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-tg"
  })
}

# ALB Listener
resource "aws_lb_listener" "formsync_backend" {
  load_balancer_arn = aws_lb.formsync_backend.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.formsync_backend.arn
  }
}

# API Gateway para backend (muito mais barato que ALB)
resource "aws_api_gateway_rest_api" "formsync_api" {
  name        = "${var.project_name}-api"
  description = "FormSync Backend API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-api"
  })
}

# API Gateway Resource
resource "aws_api_gateway_resource" "api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id
  parent_id   = aws_api_gateway_rest_api.formsync_api.root_resource_id
  path_part   = "{proxy+}"
}

# API Gateway Method
resource "aws_api_gateway_method" "api_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.formsync_api.id
  resource_id   = aws_api_gateway_resource.api_proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# API Gateway Integration (HTTP proxy para backend real)
resource "aws_api_gateway_integration" "api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_method.api_proxy.http_method

  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  # uri                     = "https://${aws_lb.formsync_backend.dns_name}/{proxy}"  # COMENTADO - ALB não existe
  uri                     = "https://httpbin.org/{proxy}"  # TEMPORÁRIO - para teste

  # request_parameters = {
  #   "integration.request.path.proxy" = "method.request.path.proxy"
  # }
}

# API Gateway Method Response
resource "aws_api_gateway_method_response" "api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_method.api_proxy.http_method
  status_code = "200"
}

# API Gateway Integration Response
resource "aws_api_gateway_integration_response" "api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id
  resource_id = aws_api_gateway_resource.api_proxy.id
  http_method = aws_api_gateway_method.api_proxy.http_method
  status_code = aws_api_gateway_method_response.api_proxy.status_code
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "formsync_api" {
  rest_api_id = aws_api_gateway_rest_api.formsync_api.id

  depends_on = [
    aws_api_gateway_integration.api_proxy,
    aws_api_gateway_method_response.api_proxy,
    aws_api_gateway_integration_response.api_proxy
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage (substitui stage_name deprecated)
resource "aws_api_gateway_stage" "formsync_api" {
  deployment_id = aws_api_gateway_deployment.formsync_api.id
  rest_api_id   = aws_api_gateway_rest_api.formsync_api.id
  stage_name    = "prod"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-api-stage"
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "formsync_backend" {
  name = "${var.project_name}-backend-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-cluster"
  })
}

# ECS Task Definition
resource "aws_ecs_task_definition" "formsync_backend" {
  family                   = "${var.project_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"   # Mínimo para Fargate
  memory                   = "512"   # Mínimo para Fargate
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "formsync-backend"
      image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project_name}-backend:latest"

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "DATABASE_URL"
          value = "jdbc:postgresql://${aws_rds_cluster.formsync_db.endpoint}/${aws_rds_cluster.formsync_db.database_name}"
        },
        {
          name  = "DB_USERNAME"
          value = aws_rds_cluster.formsync_db.master_username
        },
        {
          name  = "DB_PASSWORD"
          value = aws_rds_cluster.formsync_db.master_password
        },
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "prod"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.project_name}-backend"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-task"
  })
}

# CloudWatch Log Group - OTIMIZADO PARA CUSTO
resource "aws_cloudwatch_log_group" "formsync_backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 3  # Reduzido de 7 para 3 dias para economizar

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-logs"
  })
}

# ECS Service
resource "aws_ecs_service" "formsync_backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.formsync_backend.id
  task_definition = aws_ecs_task_definition.formsync_backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.ecs_backend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.formsync_backend.arn
    container_name   = "formsync-backend"
    container_port   = 8080
  }

  # depends_on = [aws_lb_listener.formsync_backend]  # COMENTADO - ALB não existe

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-service"
  })
}
