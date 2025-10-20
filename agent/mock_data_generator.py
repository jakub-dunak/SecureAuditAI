"""
Mock AWS resource data generator for SecureAuditAI Agent
Generates realistic AWS resource configurations for compliance testing
"""

import json
import random
import uuid
from typing import Dict, List, Any
from datetime import datetime, timedelta

class MockResourceGenerator:
    """Generates mock AWS resource data for compliance testing"""

    def __init__(self):
        self.regions = ['us-west-2', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
        self.environments = ['dev', 'staging', 'prod']

    async def generate_mock_resources(self, scan_config: Dict) -> List[Dict]:
        """
        Generate mock AWS resources based on scan configuration

        Args:
            scan_config: Configuration for resource generation

        Returns:
            List of mock AWS resource configurations
        """
        resources = []

        # Generate S3 buckets
        s3_buckets = self._generate_s3_buckets(scan_config)
        resources.extend(s3_buckets)

        # Generate EC2 instances
        ec2_instances = self._generate_ec2_instances(scan_config)
        resources.extend(ec2_instances)

        # Generate IAM roles
        iam_roles = self._generate_iam_roles(scan_config)
        resources.extend(iam_roles)

        # Generate Lambda functions
        lambda_functions = self._generate_lambda_functions(scan_config)
        resources.extend(lambda_functions)

        # Generate RDS instances
        rds_instances = self._generate_rds_instances(scan_config)
        resources.extend(rds_instances)

        # Generate CloudTrail trails
        cloudtrail_trails = self._generate_cloudtrail_trails(scan_config)
        resources.extend(cloudtrail_trails)

        return resources

    def _generate_s3_buckets(self, scan_config: Dict) -> List[Dict]:
        """Generate mock S3 bucket configurations"""
        buckets = []
        num_buckets = random.randint(5, 15)

        for i in range(num_buckets):
            bucket_name = f"example-bucket-{random.randint(100, 999)}-{uuid.uuid4().hex[:8]}"

            # Randomly assign compliance issues
            has_public_access = random.choice([True, False, False])  # 33% chance
            has_encryption = random.choice([True, True, False])  # 67% chance
            has_versioning = random.choice([True, False])
            has_logging = random.choice([True, False])

            bucket = {
                'type': 'S3_BUCKET',
                'id': bucket_name,
                'region': random.choice(self.regions),
                'createdAt': (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                'config': {
                    'publicAccess': has_public_access,
                    'encryption': has_encryption,
                    'versioning': has_versioning,
                    'logging': has_logging,
                    'blockPublicAccess': not has_public_access,
                    'tags': {
                        'Environment': random.choice(self.environments),
                        'Project': f'Project-{random.randint(1, 5)}'
                    }
                }
            }

            # Add bucket policy if public access
            if has_public_access:
                bucket['config']['policy'] = {
                    'Version': '2012-10-17',
                    'Statement': [
                        {
                            'Effect': 'Allow',
                            'Principal': '*',
                            'Action': 's3:GetObject',
                            'Resource': f'arn:aws:s3:::{bucket_name}/*'
                        }
                    ]
                }

            buckets.append(bucket)

        return buckets

    def _generate_ec2_instances(self, scan_config: Dict) -> List[Dict]:
        """Generate mock EC2 instance configurations"""
        instances = []
        num_instances = random.randint(3, 10)

        for i in range(num_instances):
            instance_id = f'i-{uuid.uuid4().hex[:17]}'

            # Random compliance issues
            has_public_ip = random.choice([True, False, False])  # 33% chance
            open_security_group = random.choice([True, False])
            outdated_ami = random.choice([True, False, False])  # 33% chance

            instance = {
                'type': 'EC2_INSTANCE',
                'id': instance_id,
                'region': random.choice(self.regions),
                'instanceType': random.choice(['t3.micro', 't3.small', 't3.medium', 'm5.large']),
                'state': 'running',
                'launchTime': (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                'config': {
                    'publicIp': has_public_ip,
                    'privateIp': f'10.0.{random.randint(1, 255)}.{random.randint(1, 255)}',
                    'securityGroups': [f'sg-{uuid.uuid4().hex[:8]}'],
                    'openSecurityGroup': open_security_group,
                    'outdatedAmi': outdated_ami,
                    'monitoring': random.choice([True, False]),
                    'tags': {
                        'Name': f'WebServer-{random.randint(1, 10)}',
                        'Environment': random.choice(self.environments)
                    }
                }
            }

            # Add security group rules if open
            if open_security_group:
                instance['config']['securityGroupRules'] = [
                    {
                        'FromPort': 22,
                        'ToPort': 22,
                        'IpProtocol': 'tcp',
                        'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
                    },
                    {
                        'FromPort': 80,
                        'ToPort': 80,
                        'IpProtocol': 'tcp',
                        'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
                    }
                ]

            instances.append(instance)

        return instances

    def _generate_iam_roles(self, scan_config: Dict) -> List[Dict]:
        """Generate mock IAM role configurations"""
        roles = []
        num_roles = random.randint(3, 8)

        for i in range(num_roles):
            role_name = f'{random.choice(["service", "app", "lambda", "ec2"])}-role-{random.randint(1, 100)}'

            # Random compliance issues
            has_wildcard = random.choice([True, False, False])  # 33% chance
            attached_policies = random.randint(1, 5)

            role = {
                'type': 'IAM_ROLE',
                'id': role_name,
                'arn': f'arn:aws:iam::123456789012:role/{role_name}',
                'createdAt': (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                'config': {
                    'permissions': ['*'] if has_wildcard else [
                        's3:GetObject',
                        's3:PutObject',
                        'dynamodb:GetItem',
                        'dynamodb:PutItem',
                        'lambda:InvokeFunction'
                    ],
                    'attachedPolicies': [f'policy-{i}' for i in range(attached_policies)],
                    'maxSessionDuration': 3600,
                    'tags': {
                        'Environment': random.choice(self.environments),
                        'ManagedBy': 'terraform'
                    }
                }
            }

            roles.append(role)

        return roles

    def _generate_lambda_functions(self, scan_config: Dict) -> List[Dict]:
        """Generate mock Lambda function configurations"""
        functions = []
        num_functions = random.randint(2, 8)

        for i in range(num_functions):
            function_name = f'{random.choice(["process", "api", "worker", "handler"])}-function-{random.randint(1, 100)}'

            # Random compliance issues
            has_sensitive_env = random.choice([True, False, False])  # 33% chance
            overprivileged_role = random.choice([True, False])

            function = {
                'type': 'LAMBDA_FUNCTION',
                'id': function_name,
                'arn': f'arn:aws:lambda:us-west-2:123456789012:function:{function_name}',
                'runtime': random.choice(['python3.9', 'python3.8', 'nodejs14.x', 'java11']),
                'handler': f'{function_name}.lambda_handler',
                'timeout': random.randint(30, 900),
                'memorySize': random.choice([128, 256, 512, 1024, 2048]),
                'createdAt': (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                'config': {
                    'environmentVariables': {
                        'ENVIRONMENT': random.choice(self.environments),
                        'LOG_LEVEL': 'INFO'
                    } if not has_sensitive_env else {
                        'ENVIRONMENT': random.choice(self.environments),
                        'DB_PASSWORD': 'plaintext-password-123',
                        'API_KEY': 'secret-api-key-456',
                        'LOG_LEVEL': 'INFO'
                    },
                    'role': f'arn:aws:iam::123456789012:role/{function_name}-role',
                    'vpcConfig': random.choice([True, False]),
                    'deadLetterConfig': random.choice([True, False]),
                    'tags': {
                        'Project': f'Project-{random.randint(1, 3)}',
                        'Environment': random.choice(self.environments)
                    }
                }
            }

            functions.append(function)

        return functions

    def _generate_rds_instances(self, scan_config: Dict) -> List[Dict]:
        """Generate mock RDS instance configurations"""
        instances = []
        num_instances = random.randint(1, 4)

        for i in range(num_instances):
            instance_id = f'database-{random.randint(1, 100)}'

            # Random compliance issues
            public_access = random.choice([True, False, False])  # 33% chance
            encryption = random.choice([True, True, False])  # 67% chance

            instance = {
                'type': 'RDS_INSTANCE',
                'id': instance_id,
                'engine': random.choice(['mysql', 'postgresql', 'aurora-mysql']),
                'engineVersion': '8.0.23',
                'instanceClass': random.choice(['db.t3.micro', 'db.t3.small', 'db.t3.medium']),
                'allocatedStorage': random.randint(20, 100),
                'region': random.choice(self.regions),
                'createdAt': (datetime.utcnow() - timedelta(days=random.randint(30, 365))).isoformat(),
                'config': {
                    'publiclyAccessible': public_access,
                    'encryption': encryption,
                    'backupRetentionPeriod': random.randint(7, 35),
                    'multiAz': random.choice([True, False]),
                    'tags': {
                        'Environment': random.choice(self.environments),
                        'Application': f'App-{random.randint(1, 3)}'
                    }
                }
            }

            instances.append(instance)

        return instances

    def _generate_cloudtrail_trails(self, scan_config: Dict) -> List[Dict]:
        """Generate mock CloudTrail trail configurations"""
        trails = []

        # Main trail (usually one per account)
        main_trail = {
            'type': 'CLOUDTRAIL_TRAIL',
            'id': 'main-trail',
            'name': 'main-trail',
            'region': 'us-west-2',  # CloudTrail is global but configured per region
            'createdAt': (datetime.utcnow() - timedelta(days=random.randint(180, 365))).isoformat(),
            'config': {
                'isMultiRegion': True,
                'includeGlobalServiceEvents': True,
                'isOrganizationTrail': False,
                'logFileValidationEnabled': random.choice([True, False]),
                'tags': {
                    'Environment': 'prod',
                    'Compliance': 'required'
                }
            }
        }

        trails.append(main_trail)

        # Additional trails (0-2 more)
        for i in range(random.randint(0, 2)):
            trail_id = f'trail-{random.randint(1, 100)}'

            trail = {
                'type': 'CLOUDTRAIL_TRAIL',
                'id': trail_id,
                'name': trail_id,
                'region': random.choice(self.regions),
                'createdAt': (datetime.utcnow() - timedelta(days=random.randint(30, 180))).isoformat(),
                'config': {
                    'isMultiRegion': False,
                    'includeGlobalServiceEvents': False,
                    'isOrganizationTrail': False,
                    'logFileValidationEnabled': random.choice([True, False]),
                    'tags': {
                        'Environment': random.choice(self.environments),
                        'Purpose': random.choice(['security', 'audit', 'debug'])
                    }
                }
            }

            trails.append(trail)

        return trails

# Global generator instance
generator = MockResourceGenerator()

async def generate_mock_resources(scan_config: Dict) -> List[Dict]:
    """Convenience function to generate mock resources"""
    return await generator.generate_mock_resources(scan_config)
