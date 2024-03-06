terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-west-2"
}

resource "aws_security_group" "allow_http_ssh_and_http_on_80" {
  name        = "allow_http"
  description = "Allow http inbound traffic"
  ingress {
    description = "http"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "ssh"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "allow_http_ssh"
  }
}

resource "tls_private_key" "ec2_instances_key" {
  algorithm = "ED25519"
}

resource "aws_key_pair" "ec2_instance_generated_key_pair" {
  key_name   = "ec2-instances"
  public_key = tls_private_key.ec2_instances_key.public_key_openssh

  provisioner "local-exec" {
    command = "echo '${tls_private_key.ec2_instances_key.private_key_openssh}' > ./ec2-instances.pem"
  }
}

resource "aws_instance" "app_server" {
  ami                    = "ami-0fcf52bcf5db7b003" # Ubuntu Server 22.04 LTS
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.ec2_instance_generated_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.allow_http_ssh_and_http_on_80.id]
  user_data              = <<-EOF
#!/bin/bash

# sudo snap install docker
echo "Installing docker-compose"                                  # will be visible in VM /var/log/syslog
sudo apt-get update -y && sudo apt-get install docker-compose -y

echo "Adding user ubuntu to group docker"                         # will be visible in VM /var/log/syslog
# sudo groupadd docker
sudo usermod -aG docker ubuntu

EOF

  tags = {
    Name = "app-server"
  }
}

output "public_key" {
  value     = tls_private_key.ec2_instances_key.public_key_openssh
  sensitive = true
}