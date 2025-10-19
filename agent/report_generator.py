"""
Compliance report generator for SecureAuditAI Agent
Generates detailed PDF reports from compliance findings
"""

import json
import boto3
import uuid
from datetime import datetime
from typing import Dict, List, Any
from io import BytesIO

# Note: In a real implementation, you would use reportlab or similar PDF library
# For this demo, we'll create a structured report format that could be converted to PDF

class ComplianceReportGenerator:
    """Generates compliance reports from audit findings"""

    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.reports_bucket = None  # Will be set from environment

    async def generate_compliance_report(
        self,
        audit_run_id: str,
        findings: List[Dict],
        compliance_scores: Dict[str, float],
        overall_score: float,
        frameworks: List[str],
        resources_scanned: int
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive compliance report

        Returns:
            Report metadata including S3 location
        """
        try:
            # Generate report content
            report_content = self._create_report_content(
                audit_run_id, findings, compliance_scores, overall_score, frameworks, resources_scanned
            )

            # Generate PDF (mock - in real implementation would use reportlab)
            pdf_buffer = self._generate_pdf_report(report_content)

            # Upload to S3
            report_key = f"reports/{audit_run_id}/compliance-report-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}.pdf"
            s3_url = self._upload_to_s3(pdf_buffer, report_key)

            return {
                'reportId': str(uuid.uuid4()),
                'auditRunId': audit_run_id,
                'generatedAt': datetime.utcnow().isoformat(),
                's3Location': s3_url,
                's3Key': report_key,
                'findingsCount': len(findings),
                'overallScore': overall_score,
                'frameworks': frameworks,
                'status': 'COMPLETED'
            }

        except Exception as e:
            return {
                'reportId': str(uuid.uuid4()),
                'auditRunId': audit_run_id,
                'generatedAt': datetime.utcnow().isoformat(),
                'status': 'ERROR',
                'error': str(e)
            }

    def _create_report_content(
        self,
        audit_run_id: str,
        findings: List[Dict],
        compliance_scores: Dict[str, float],
        overall_score: float,
        frameworks: List[str],
        resources_scanned: int
    ) -> Dict[str, Any]:
        """Create structured report content"""

        # Group findings by severity
        findings_by_severity = {
            'CRITICAL': [f for f in findings if f.get('severity') == 'CRITICAL'],
            'HIGH': [f for f in findings if f.get('severity') == 'HIGH'],
            'MEDIUM': [f for f in findings if f.get('severity') == 'MEDIUM'],
            'LOW': [f for f in findings if f.get('severity') == 'LOW']
        }

        # Group findings by resource type
        findings_by_type = {}
        for finding in findings:
            resource_type = finding.get('resourceType', 'Unknown')
            if resource_type not in findings_by_type:
                findings_by_type[resource_type] = []
            findings_by_type[resource_type].append(finding)

        # Generate executive summary
        executive_summary = self._generate_executive_summary(
            overall_score, findings_by_severity, compliance_scores, frameworks
        )

        # Generate detailed findings
        detailed_findings = self._generate_detailed_findings(findings)

        # Generate recommendations
        recommendations = self._generate_recommendations(findings)

        report_content = {
            'metadata': {
                'reportId': str(uuid.uuid4()),
                'auditRunId': audit_run_id,
                'generatedAt': datetime.utcnow().isoformat(),
                'frameworks': frameworks,
                'resourcesScanned': resources_scanned,
                'totalFindings': len(findings),
                'overallComplianceScore': round(overall_score, 1)
            },
            'executiveSummary': executive_summary,
            'complianceScores': compliance_scores,
            'findingsSummary': {
                'bySeverity': {
                    severity: len(findings_list)
                    for severity, findings_list in findings_by_severity.items()
                },
                'byResourceType': {
                    resource_type: len(findings_list)
                    for resource_type, findings_list in findings_by_type.items()
                }
            },
            'detailedFindings': detailed_findings,
            'recommendations': recommendations,
            'appendices': {
                'scanConfiguration': 'Standard compliance scan configuration',
                'scoringMethodology': 'Risk-based scoring with 0-100 scale',
                'reportVersion': '1.0.0'
            }
        }

        return report_content

    def _generate_executive_summary(
        self,
        overall_score: float,
        findings_by_severity: Dict[str, List],
        compliance_scores: Dict[str, float],
        frameworks: List[str]
    ) -> str:
        """Generate executive summary text"""

        critical_count = len(findings_by_severity.get('CRITICAL', []))
        high_count = len(findings_by_severity.get('HIGH', []))

        summary = f"""
        EXECUTIVE SUMMARY

        This compliance audit report presents the results of a comprehensive security assessment
        conducted against {', '.join(frameworks)} requirements.

        OVERALL COMPLIANCE SCORE: {overall_score:.1f}/100

        KEY FINDINGS:
        • {critical_count} Critical severity findings requiring immediate attention
        • {high_count} High severity findings requiring prompt remediation
        • Total of {sum(len(findings) for findings in findings_by_severity.values())} compliance issues identified

        FRAMEWORK SCORES:
        """

        for framework, score in compliance_scores.items():
            summary += f"• {framework}: {score:.1f}/100\n"

        if critical_count > 0:
            summary += f"""
        IMMEDIATE ACTION REQUIRED:
        {critical_count} critical findings have been identified that pose significant security risks
        and require immediate remediation to maintain compliance.
        """
        else:
            summary += """
        No critical findings were identified in this audit. Continue monitoring and
        regular assessments to maintain compliance posture.
        """

        return summary.strip()

    def _generate_detailed_findings(self, findings: List[Dict]) -> List[Dict]:
        """Generate detailed findings section"""

        detailed_findings = []

        for i, finding in enumerate(findings, 1):
            detailed_finding = {
                'findingNumber': i,
                'title': finding.get('title', 'Untitled Finding'),
                'severity': finding.get('severity', 'UNKNOWN'),
                'resourceType': finding.get('resourceType', 'Unknown'),
                'resourceId': finding.get('resourceId', 'Unknown'),
                'description': finding.get('description', 'No description provided'),
                'complianceFrameworks': finding.get('complianceFrameworks', []),
                'riskScore': finding.get('riskScore', 0),
                'remediationSteps': finding.get('remediationSteps', []),
                'recommendations': finding.get('recommendations', ''),
                'status': finding.get('status', 'OPEN')
            }

            detailed_findings.append(detailed_finding)

        return detailed_findings

    def _generate_recommendations(self, findings: List[Dict]) -> List[str]:
        """Generate prioritized recommendations"""

        recommendations = []

        # Group by severity for prioritization
        critical_findings = [f for f in findings if f.get('severity') == 'CRITICAL']
        high_findings = [f for f in findings if f.get('severity') == 'HIGH']

        if critical_findings:
            recommendations.append(
                f"PRIORITY 1: Address {len(critical_findings)} critical findings immediately"
            )

        if high_findings:
            recommendations.append(
                f"PRIORITY 2: Remediate {len(high_findings)} high-severity findings within 30 days"
            )

        # General recommendations
        recommendations.extend([
            "Implement automated compliance monitoring to detect issues proactively",
            "Establish regular compliance audit schedules",
            "Train development teams on compliance requirements",
            "Implement automated remediation for common issues"
        ])

        return recommendations

    def _generate_pdf_report(self, report_content: Dict) -> BytesIO:
        """Generate PDF report (mock implementation)"""

        # In a real implementation, this would use reportlab or similar:
        # from reportlab.lib.pagesizes import letter
        # from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        # etc.

        # For demo purposes, create a JSON structure that represents the PDF content
        pdf_data = {
            'contentType': 'application/pdf',
            'metadata': report_content['metadata'],
            'structure': {
                'sections': [
                    'Executive Summary',
                    'Compliance Scores',
                    'Findings Summary',
                    'Detailed Findings',
                    'Recommendations',
                    'Appendices'
                ]
            },
            'pageCount': 15,  # Mock page count
            'generatedAt': datetime.utcnow().isoformat()
        }

        # Convert to bytes (mock PDF)
        pdf_buffer = BytesIO()
        pdf_buffer.write(json.dumps(pdf_data, indent=2).encode('utf-8'))
        pdf_buffer.seek(0)

        return pdf_buffer

    def _upload_to_s3(self, pdf_buffer: BytesIO, report_key: str) -> str:
        """Upload PDF report to S3"""

        # In a real implementation, get bucket from environment
        bucket_name = self.reports_bucket or 'secureauditai-reports-dev'

        try:
            self.s3_client.put_object(
                Bucket=bucket_name,
                Key=report_key,
                Body=pdf_buffer.getvalue(),
                ContentType='application/pdf',
                Metadata={
                    'report-type': 'compliance-audit',
                    'generated-at': datetime.utcnow().isoformat()
                }
            )

            # Generate presigned URL (valid for 7 days)
            presigned_url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': report_key
                },
                ExpiresIn=7 * 24 * 3600  # 7 days
            )

            return presigned_url

        except Exception as e:
            raise Exception(f"Failed to upload report to S3: {str(e)}")

# Global report generator instance
report_generator = ComplianceReportGenerator()

async def generate_compliance_report(
    audit_run_id: str,
    findings: List[Dict],
    compliance_scores: Dict[str, float],
    overall_score: float,
    frameworks: List[str],
    resources_scanned: int
) -> Dict[str, Any]:
    """Convenience function to generate compliance report"""
    return await report_generator.generate_compliance_report(
        audit_run_id, findings, compliance_scores, overall_score, frameworks, resources_scanned
    )
