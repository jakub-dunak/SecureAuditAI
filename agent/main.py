#!/usr/bin/env python3
"""
SecureAuditAI AgentCore Runtime - Main entry point for the compliance auditing agent
Uses Bedrock AgentCore SDK with Strands for orchestration
"""

import json
import os
import boto3
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import Bedrock AgentCore SDK
from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent, tool

# Import custom modules
from compliance_analyzer import analyze_compliance
from mock_data_generator import generate_mock_resources
from report_generator import generate_compliance_report

# Get AgentCore resource IDs from environment
MEMORY_ID = os.environ.get('AGENTCORE_MEMORY_ID')
GATEWAY_ID = os.environ.get('AGENTCORE_GATEWAY_ID')

# Initialize Bedrock AgentCore app (Memory/Gateway optional)
app = BedrockAgentCoreApp()

@app.entrypoint
async def audit_compliance(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for compliance auditing
    """
    try:
        # Extract request parameters
        compliance_frameworks = request.get('complianceFrameworks', ['GDPR', 'SOC2', 'PCI-DSS'])
        scan_config = request.get('scanConfig', {})
        audit_run_id = request.get('auditRunId', str(uuid.uuid4()))

        print(f"🔍 Starting compliance audit: {audit_run_id}")
        print(f"📋 Frameworks: {', '.join(compliance_frameworks)}")

        # Step 1: Generate mock resource data (in real implementation, this would scan actual AWS resources)
        print("🏗️  Generating resource inventory...")
        resources = await generate_mock_resources(scan_config)

        # Step 2: Analyze compliance for each framework
        print("🔬 Analyzing compliance...")
        all_findings = []
        compliance_scores = {}

        for framework in compliance_frameworks:
            print(f"📊 Analyzing {framework} compliance...")
            framework_findings = await analyze_compliance(framework, resources, scan_config)
            all_findings.extend(framework_findings)

            # Calculate framework-specific score
            if framework_findings:
                avg_risk = sum(finding.get('riskScore', 50) for finding in framework_findings) / len(framework_findings)
                compliance_scores[framework] = max(0, 100 - avg_risk)
            else:
                compliance_scores[framework] = 100.0

        # Step 3: Generate compliance report
        print("📄 Generating compliance report...")
        overall_score = sum(compliance_scores.values()) / len(compliance_scores) if compliance_scores else 100.0

        report = await generate_compliance_report(
            audit_run_id=audit_run_id,
            findings=all_findings,
            compliance_scores=compliance_scores,
            overall_score=overall_score,
            frameworks=compliance_frameworks,
            resources_scanned=len(resources)
        )

        # Step 4: Return results
        result = {
            'auditRunId': audit_run_id,
            'status': 'COMPLETED',
            'findings': all_findings,
            'complianceScores': compliance_scores,
            'overallScore': round(overall_score, 1),
            'resourcesScanned': len(resources),
            'frameworks': compliance_frameworks,
            'reportGenerated': True,
            'completedAt': datetime.utcnow().isoformat()
        }

        print(f"✅ Audit completed: {len(all_findings)} findings, {overall_score:.1f}% compliance")
        return result

    except Exception as e:
        print(f"❌ Audit failed: {str(e)}")
        return {
            'auditRunId': request.get('auditRunId', 'unknown'),
            'status': 'ERROR',
            'error': str(e),
            'completedAt': datetime.utcnow().isoformat()
        }

@app.entrypoint
async def analyze_single_framework(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze compliance for a single framework
    """
    try:
        framework = request['framework']
        resources = request.get('resources', [])
        scan_config = request.get('scanConfig', {})

        print(f"🔍 Analyzing {framework} compliance for {len(resources)} resources")

        findings = await analyze_compliance(framework, resources, scan_config)

        return {
            'framework': framework,
            'findings': findings,
            'findingsCount': len(findings),
            'status': 'COMPLETED'
        }

    except Exception as e:
        return {
            'framework': request.get('framework', 'unknown'),
            'status': 'ERROR',
            'error': str(e)
        }

@app.entrypoint
async def generate_resources(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate mock AWS resource data for testing
    """
    try:
        scan_config = request.get('scanConfig', {})

        resources = await generate_mock_resources(scan_config)

        return {
            'resources': resources,
            'count': len(resources),
            'status': 'COMPLETED'
        }

    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e)
        }

# Health check endpoint for debugging
@app.entrypoint
async def health_check(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Health check endpoint for the agent
    """
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'service': 'SecureAuditAI-AgentCore'
    }

if __name__ == "__main__":
    # Run the AgentCore app
    print("🚀 Starting SecureAuditAI AgentCore Runtime...")
    app.run()
