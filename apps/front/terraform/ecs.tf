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
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "formsync-backend"
      image = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/formsync-backend:latest"
      
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "prod"
        },
        {
          name  = "DATABASE_URL"
          value = "jdbc:postgresql://${aws_db_instance.formsync_db.endpoint}/${aws_db_instance.formsync_db.db_name}"
        }
      ]
      
      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_secretsmanager_secret.db_password.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.formsync_backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-task"
  })
}

# ECS Service
resource "aws_ecs_service" "formsync_backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.formsync_backend.id
  task_definition = aws_ecs_task_definition.formsync_backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_backend.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.formsync_backend.arn
    container_name   = "formsync-backend"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.formsync_backend]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-service"
  })
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "formsync_backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 30

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-logs"
  })
}
