#!/usr/bin/env python3
"""
Setup script for AgentCore Memory and Gateway resources
"""
import boto3
import json
import sys
import os
from datetime import datetime

def setup_memory(region, environment, stack_name):
    """
    Create AgentCore Memory with Session Summarizer and Semantic Memory strategies
    """
    client = boto3.client('bedrock-agentcore-control', region_name=region)
    
    memory_name = f"{stack_name}-memory-{environment}"
    
    print(f"📦 Creating AgentCore Memory: {memory_name}")
    
    try:
        # Create memory with multiple strategies
        response = client.create_memory(
            name=memory_name,
            description=f"Memory for SecureAuditAI compliance agent - {environment}",
            eventExpiryDuration=90,  # Required: days to retain events
            memoryStrategies=[
                {
                    'summaryMemoryStrategy': {
                        'name': 'SessionSummarizer',
                        'description': 'Summarizes compliance audit sessions',
                        'namespaces': ['/summaries/{actorId}/{sessionId}']
                    }
                },
                {
                    'semanticMemoryStrategy': {
                        'name': 'ComplianceKnowledge',
                        'description': 'Semantic memory for compliance frameworks and findings',
                        'namespaces': ['/knowledge/compliance/{framework}']
                    }
                },
                {
                    'userPreferenceMemoryStrategy': {
                        'name': 'UserPreferences',
                        'description': 'Stores user preferences for audit configurations',
                        'namespaces': ['/preferences/{userId}']
                    }
                }
            ],
            tags={
                'Environment': environment,
                'Project': 'SecureAuditAI',
                'ManagedBy': 'AgentCore'
            }
        )
        
        memory_id = response['memoryId']
        print(f"✅ Memory created successfully: {memory_id}")
        
        # Note: Memory is typically available immediately after creation
        # No waiter needed as the API call is synchronous
        
        return memory_id
        
    except client.exceptions.ConflictException:
        print(f"⚠️  Memory '{memory_name}' already exists, retrieving existing...")
        
        # List memories and find the existing one
        response = client.list_memories()
        for memory in response.get('memories', []):
            if memory['name'] == memory_name:
                memory_id = memory['memoryId']
                print(f"✅ Found existing memory: {memory_id}")
                return memory_id
        
        raise Exception(f"Memory '{memory_name}' exists but could not be found")
    
    except Exception as e:
        print(f"❌ Failed to create memory: {str(e)}")
        raise

def setup_gateway(region, environment, stack_name):
    """
    Create AgentCore Gateway for tool integration
    """
    client = boto3.client('bedrock-agentcore-control', region_name=region)
    
    gateway_name = f"{stack_name}-gateway-{environment}"
    
    print(f"🌐 Creating AgentCore Gateway: {gateway_name}")
    
    try:
        # Create gateway
        response = client.create_gateway(
            name=gateway_name,
            description=f"Gateway for SecureAuditAI tool integrations - {environment}",
            gatewayConfiguration={
                'inboundAuthentication': {
                    'type': 'IAM',
                    'iamConfiguration': {
                        'allowedPrincipals': ['*']  # Will be restricted via IAM policies
                    }
                }
            },
            tags={
                'Environment': environment,
                'Project': 'SecureAuditAI',
                'ManagedBy': 'AgentCore'
            }
        )
        
        gateway_id = response['gatewayId']
        print(f"✅ Gateway created successfully: {gateway_id}")
        
        # Get gateway details including endpoint
        # Note: Gateway is typically available immediately after creation
        gateway_details = client.get_gateway(gatewayId=gateway_id)
        gateway_endpoint = gateway_details.get('gatewayEndpoint', '')
        
        print(f"📡 Gateway endpoint: {gateway_endpoint}")
        
        return {
            'gateway_id': gateway_id,
            'gateway_endpoint': gateway_endpoint
        }
        
    except client.exceptions.ConflictException:
        print(f"⚠️  Gateway '{gateway_name}' already exists, retrieving existing...")
        
        # List gateways and find the existing one
        response = client.list_gateways()
        for gateway in response.get('gateways', []):
            if gateway['name'] == gateway_name:
                gateway_id = gateway['gatewayId']
                
                # Get full details
                gateway_details = client.get_gateway(gatewayId=gateway_id)
                gateway_endpoint = gateway_details.get('gatewayEndpoint', '')
                
                print(f"✅ Found existing gateway: {gateway_id}")
                print(f"📡 Gateway endpoint: {gateway_endpoint}")
                
                return {
                    'gateway_id': gateway_id,
                    'gateway_endpoint': gateway_endpoint
                }
        
        raise Exception(f"Gateway '{gateway_name}' exists but could not be found")
    
    except Exception as e:
        print(f"❌ Failed to create gateway: {str(e)}")
        raise

def store_in_ssm(region, stack_name, environment, memory_id, gateway_id, gateway_endpoint):
    """
    Store Memory and Gateway IDs in SSM Parameter Store
    """
    ssm = boto3.client('ssm', region_name=region)
    
    parameters = {
        f'/{stack_name}/{environment}/agentcore-memory-id': memory_id,
        f'/{stack_name}/{environment}/agentcore-gateway-id': gateway_id,
        f'/{stack_name}/{environment}/agentcore-gateway-endpoint': gateway_endpoint
    }
    
    print("\n💾 Storing resource IDs in SSM Parameter Store...")
    
    for param_name, param_value in parameters.items():
        try:
            ssm.put_parameter(
                Name=param_name,
                Value=param_value,
                Type='String',
                Overwrite=True,
                Description=f'AgentCore resource for {stack_name} {environment}'
            )
            print(f"✅ Stored: {param_name}")
        except Exception as e:
            print(f"⚠️  Failed to store {param_name}: {str(e)}")

def main():
    """
    Main setup function
    """
    # Get parameters from environment or command line
    region = os.environ.get('AWS_REGION', sys.argv[1] if len(sys.argv) > 1 else 'us-west-2')
    environment = os.environ.get('ENVIRONMENT', sys.argv[2] if len(sys.argv) > 2 else 'dev')
    stack_name = os.environ.get('STACK_NAME', sys.argv[3] if len(sys.argv) > 3 else 'secureauditai-agent')
    
    print("=" * 80)
    print("🚀 AgentCore Resource Setup")
    print("=" * 80)
    print(f"📍 Region: {region}")
    print(f"🏷️  Environment: {environment}")
    print(f"📦 Stack Name: {stack_name}")
    print("=" * 80)
    print()
    
    try:
        # Setup Memory
        memory_id = setup_memory(region, environment, stack_name)
        print()
        
        # Setup Gateway
        gateway_info = setup_gateway(region, environment, stack_name)
        gateway_id = gateway_info['gateway_id']
        gateway_endpoint = gateway_info['gateway_endpoint']
        print()
        
        # Store in SSM
        store_in_ssm(region, stack_name, environment, memory_id, gateway_id, gateway_endpoint)
        print()
        
        # Output summary
        print("=" * 80)
        print("✅ AgentCore Resources Setup Complete!")
        print("=" * 80)
        print(f"Memory ID: {memory_id}")
        print(f"Gateway ID: {gateway_id}")
        print(f"Gateway Endpoint: {gateway_endpoint}")
        print("=" * 80)
        
        # Output JSON for GitHub Actions
        output = {
            'memory_id': memory_id,
            'gateway_id': gateway_id,
            'gateway_endpoint': gateway_endpoint
        }
        print(f"\n::set-output name=agentcore_resources::{json.dumps(output)}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Setup failed: {str(e)}")
        return 1

if __name__ == '__main__':
    sys.exit(main())

