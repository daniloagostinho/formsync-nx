# RDS Subnet Group (usando subnets públicas para economizar)
resource "aws_db_subnet_group" "formsync_db" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.public[*].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-subnet-group"
  })
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rds-sg"
  })
}

# RDS Aurora PostgreSQL (using provisioned instead of deprecated serverless v1)
resource "aws_rds_cluster" "formsync_db" {
  cluster_identifier = "${var.project_name}-db"

  engine         = "aurora-postgresql"
  engine_version = "15.4"

  database_name   = var.db_name
  master_username = var.db_username
  master_password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.formsync_db.name

  skip_final_snapshot = true
  deletion_protection = false

  # Backup mínimo
  backup_retention_period      = 1
  preferred_backup_window      = "03:00-04:00"
  preferred_maintenance_window = "sun:04:00-sun:05:00"

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db"
  })
}

# RDS Cluster Instance (required for Aurora)
resource "aws_rds_cluster_instance" "formsync_db" {
  cluster_identifier = aws_rds_cluster.formsync_db.id
  instance_class     = "db.t3.small"  # Menor instância disponível para reduzir custos
  engine             = aws_rds_cluster.formsync_db.engine
  engine_version     = aws_rds_cluster.formsync_db.engine_version

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-instance"
  })
}
