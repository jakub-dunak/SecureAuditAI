"""
API handler for findings operations
"""
import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

def lambda_handler(event, context):
    """
    Handle findings API requests
    """
    try:
        # Initialize DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['FINDINGS_TABLE'])

        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters', {})
        query_params = event.get('queryStringParameters', {})

        if http_method == 'GET':
            return get_findings(table, query_params)
        elif http_method == 'POST':
            return create_finding(table, event)
        elif http_method == 'PUT' and path_parameters:
            finding_id = path_parameters.get('findingId')
            if finding_id:
                return update_finding(table, finding_id, event)
        elif http_method == 'DELETE' and path_parameters:
            finding_id = path_parameters.get('findingId')
            if finding_id:
                return delete_finding(table, finding_id)

        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({'error': 'Invalid request'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }

def get_findings(table, query_params):
    """Get findings with filtering and pagination"""
    # Parse query parameters
    audit_run_id = query_params.get('auditRunId')
    severity = query_params.get('severity')
    resource_type = query_params.get('resourceType')
    status = query_params.get('status', 'OPEN')
    limit = int(query_params.get('limit', 50))
    last_key = query_params.get('lastKey')

    # Build filter expression
    filter_expression = None
    expression_values = {}

    if audit_run_id:
        filter_expression = Key('AuditRunId').eq(audit_run_id)
    if severity:
        if filter_expression:
            filter_expression = filter_expression & Key('Severity').eq(severity)
        else:
            filter_expression = Key('Severity').eq(severity)
    if resource_type:
        if filter_expression:
            filter_expression = filter_expression & Key('ResourceType').eq(resource_type)
        else:
            filter_expression = Key('ResourceType').eq(resource_type)
    if status:
        if filter_expression:
            filter_expression = filter_expression & Key('Status').eq(status)
        else:
            filter_expression = Key('Status').eq(status)

    # Scan with filtering
    scan_kwargs = {'Limit': limit}
    if filter_expression:
        scan_kwargs['FilterExpression'] = filter_expression
    if last_key:
        scan_kwargs['ExclusiveStartKey'] = json.loads(last_key)

    response = table.scan(**scan_kwargs)
    items = response.get('Items', [])
    last_evaluated_key = response.get('LastEvaluatedKey')

    # Convert Decimal to int/float for JSON serialization
    for item in items:
        for key, value in item.items():
            if isinstance(value, Decimal):
                item[key] = float(value) if '.' in str(value) else int(value)

    response_body = {
        'findings': items,
        'count': len(items)
    }

    if last_evaluated_key:
        response_body['lastKey'] = json.dumps(last_evaluated_key)

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        'body': json.dumps(response_body)
    }

def create_finding(table, event):
    """Create a new finding"""
    try:
        body = json.loads(event['body'])

        # Generate finding ID if not provided
        finding_id = body.get('findingId', f"finding-{body.get('auditRunId', 'unknown')}-{hash(str(body)) % 10000}")

        # Create finding item
        finding = {
            'FindingId': finding_id,
            'AuditRunId': body['auditRunId'],
            'Title': body['title'],
            'Description': body['description'],
            'Severity': body.get('severity', 'MEDIUM'),
            'ResourceType': body['resourceType'],
            'ResourceId': body['resourceId'],
            'ComplianceFrameworks': body.get('complianceFrameworks', []),
            'Status': body.get('status', 'OPEN'),
            'CreatedAt': body.get('createdAt'),
            'UpdatedAt': body.get('updatedAt'),
            'RemediationSteps': body.get('remediationSteps', []),
            'RiskScore': body.get('riskScore', 50),
            'Tags': body.get('tags', {}),
            'Metadata': body.get('metadata', {})
        }

        # Set timestamps if not provided
        import time
        current_time = str(int(time.time()))
        if not finding['CreatedAt']:
            finding['CreatedAt'] = current_time
        if not finding['UpdatedAt']:
            finding['UpdatedAt'] = current_time

        table.put_item(Item=finding)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'finding': finding,
                'message': 'Finding created successfully'
            })
        }

    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({'error': f'Invalid request body: {str(e)}'})
        }

def update_finding(table, finding_id, event):
    """Update an existing finding"""
    try:
        body = json.loads(event['body'])

        # Build update expression
        update_expression = 'SET '
        expression_values = {}
        expression_names = {}

        update_fields = []
        for field in ['Title', 'Description', 'Severity', 'Status', 'RemediationSteps', 'RiskScore', 'Tags', 'Metadata']:
            if field in body:
                update_fields.append(field)
                expression_values[f':{field.lower()}'] = body[field]
                expression_names[f'#{field.lower()}'] = field

        if not update_fields:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No fields to update'})
            }

        update_expression += ', '.join([f'#{field.lower()} = :{field.lower()}' for field in update_fields])
        update_expression += ', UpdatedAt = :updated_at'

        expression_values[':updated_at'] = str(int(time.time()))

        # Update item
        response = table.update_item(
            Key={'FindingId': finding_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ExpressionAttributeNames=expression_names,
            ReturnValues='ALL_NEW'
        )

        updated_item = response.get('Attributes', {})

        # Convert Decimal to int/float for JSON serialization
        for key, value in updated_item.items():
            if isinstance(value, Decimal):
                updated_item[key] = float(value) if '.' in str(value) else int(value)

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({
                'finding': updated_item,
                'message': 'Finding updated successfully'
            })
        }

    except table.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({'error': 'Finding not found'})
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({'error': f'Update failed: {str(e)}'})
        }

def delete_finding(table, finding_id):
    """Delete a finding"""
    try:
        response = table.delete_item(
            Key={'FindingId': finding_id},
            ReturnValues='ALL_OLD'
        )

        deleted_item = response.get('Attributes')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'message': 'Finding deleted successfully',
                'deletedFinding': deleted_item
            })
        }

    except table.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({'error': 'Finding not found'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({'error': f'Deletion failed: {str(e)}'})
        }
