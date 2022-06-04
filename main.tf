terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "VargasArts"
    workspaces {
      prefix = "parlaypartaydavidvargasme"
    }
  }
  required_providers {
    github = {
      source = "integrations/github"
      version = "4.2.0"
    }
  }
}

variable "aws_access_token" {
  type = string
}

variable "aws_secret_token" {
  type = string
}

variable "github_token" {
  type = string
}

variable "secret" {
  type = string
}

variable "clerk_api_key" {
    type = string
}

variable "mysql_password" {
  type = string
}

variable "stripe_public" {
  type = string
}

variable "stripe_secret" {
  type = string
}

variable "stripe_webhook_secret" {
  type = string
}

variable "odds_api_key" {
  type = string
}

provider "aws" {
  region = "us-east-1"
  access_key = var.aws_access_token
  secret_key = var.aws_secret_token
}

provider "github" {
  owner = "dvargas92495"
  token = var.github_token
}

module "aws_static_site" {
  source  = "dvargas92495/static-site/aws"

  origin_memory_size = 5120
  origin_timeout = 20
  domain = "parlaypartay.davidvargas.me"
  secret = var.secret

  providers = {
    aws.us-east-1 = aws
  }
}

module "aws-serverless-backend" {
    source  = "dvargas92495/serverless-backend/aws"

    api_name  = "parlaypartay-davidvargas-me"
    domain    = "parlaypartay.davidvargas.me"
    directory = "api"
}

resource "github_actions_secret" "deploy_aws_access_key" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "DEPLOY_AWS_ACCESS_KEY"
  plaintext_value  = module.aws_static_site.deploy-id
}

resource "github_actions_secret" "deploy_aws_access_secret" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "DEPLOY_AWS_ACCESS_SECRET"
  plaintext_value  = module.aws_static_site.deploy-secret
}

resource "github_actions_secret" "lambda_aws_access_key" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "LAMBDA_AWS_ACCESS_KEY"
  plaintext_value  = module.aws-serverless-backend.access_key
}

resource "github_actions_secret" "lambda_aws_access_secret" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "LAMBDA_AWS_ACCESS_SECRET"
  plaintext_value  = module.aws-serverless-backend.secret_key
}

resource "github_actions_secret" "mysql_password" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "MYSQL_PASSWORD"
  plaintext_value  = var.mysql_password
}

resource "github_actions_secret" "clerk_api_key" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "CLERK_API_KEY"
  plaintext_value  = var.clerk_api_key
}

resource "github_actions_secret" "cloudfront_distribution_id" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "CLOUDFRONT_DISTRIBUTION_ID"
  plaintext_value  = module.aws_static_site.cloudfront_distribution_id
}

resource "github_actions_secret" "stripe_public" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "STRIPE_PUBLIC_KEY"
  plaintext_value  = var.stripe_public
}

resource "github_actions_secret" "stripe_secret" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "STRIPE_SECRET_KEY"
  plaintext_value  = var.stripe_secret
}

resource "github_actions_secret" "stripe_webhook_secret" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "STRIPE_WEBHOOK_SECRET"
  plaintext_value  = var.stripe_webhook_secret
}

resource "github_actions_secret" "odds_api_key" {
  repository       = "parlaypartay.davidvargas.me"
  secret_name      = "ODDS_API_KEY"
  plaintext_value  = var.odds_api_key
}
