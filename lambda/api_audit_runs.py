"""
API handler for audit runs operations
"""
import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import datetime

def lambda_handler(event, context):
    """
    Handle audit runs API requests
    """
    try:
        # Initialize DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['AUDIT_RUNS_TABLE'])

        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters', {})

        if http_method == 'GET':
            return get_audit_runs(table, event)
        elif http_method == 'POST':
            return create_audit_run(table, event)
        elif http_method == 'PUT' and path_parameters:
            audit_run_id = path_parameters.get('auditRunId')
            if audit_run_id:
                return update_audit_run(table, audit_run_id, event)
        elif http_method == 'DELETE' and path_parameters:
            audit_run_id = path_parameters.get('auditRunId')
            if audit_run_id:
                return delete_audit_run(table, audit_run_id)

        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
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
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({'error': str(e)})
        }

def get_audit_runs(table, event):
    """Get audit runs with optional filtering"""
    query_params = event.get('queryStringParameters', {})

    # Parse query parameters
    status = query_params.get('status')
    limit = int(query_params.get('limit', 50))
    start_date = query_params.get('startDate')
    end_date = query_params.get('endDate')

    # Build scan parameters
    scan_kwargs = {}
    filter_expression = None

    if status:
        filter_expression = Key('Status').eq(status)

    if start_date or end_date:
        if not filter_expression:
            filter_expression = Key('CreatedAt').between(start_date or '1970-01-01T00:00:00', end_date or datetime.utcnow().isoformat())
        else:
            # Note: In a real implementation, you'd need to use a more complex filter
            pass

    # Scan table
    if filter_expression:
        response = table.scan(
            FilterExpression=filter_expression,
            Limit=limit
        )
    else:
        response = table.scan(Limit=limit)

    items = response.get('Items', [])

    # Convert Decimal to int/float for JSON serialization
    for item in items:
        for key, value in item.items():
            if isinstance(value, Decimal):
                item[key] = float(value) if '.' in str(value) else int(value)

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': event.get('headers', {}).get('origin', '*'),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        'body': json.dumps({
            'auditRuns': items,
            'count': len(items)
        })
    }

def create_audit_run(table, event):
    """Create a new audit run"""
    try:
        body = json.loads(event['body'])
        audit_run_id = body.get('auditRunId')

        if not audit_run_id:
            import uuid
            audit_run_id = str(uuid.uuid4())

        # Create audit run item
        audit_run = {
            'AuditRunId': audit_run_id,
            'Status': body.get('status', 'PENDING'),
            'CreatedAt': datetime.utcnow().isoformat(),
            'Environment': os.environ.get('ENVIRONMENT', 'dev'),
            'BedrockModelId': os.environ.get('BEDROCK_MODEL_ID', ''),
            'Description': body.get('description', ''),
            'ComplianceFrameworks': body.get('complianceFrameworks', ['GDPR', 'SOC2', 'PCI-DSS']),
            'ScanConfig': body.get('scanConfig', {})
        }

        table.put_item(Item=audit_run)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'auditRun': audit_run,
                'message': 'Audit run created successfully'
            })
        }

    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({'error': f'Invalid request body: {str(e)}'})
        }

def update_audit_run(table, audit_run_id, event):
    """Update an existing audit run"""
    try:
        body = json.loads(event['body'])

        # Build update expression
        update_expression = 'SET '
        expression_values = {}
        expression_names = {}

        update_fields = []
        for field in ['Status', 'Description', 'ScanConfig']:
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

        expression_values[':updated_at'] = datetime.utcnow().isoformat()

        # Update item
        response = table.update_item(
            Key={'AuditRunId': audit_run_id},
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
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({
                'auditRun': updated_item,
                'message': 'Audit run updated successfully'
            })
        }

    except table.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({'error': 'Audit run not found'})
        }
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({'error': f'Update failed: {str(e)}'})
        }

def delete_audit_run(table, audit_run_id):
    """Delete an audit run"""
    try:
        response = table.delete_item(
            Key={'AuditRunId': audit_run_id},
            ReturnValues='ALL_OLD'
        )

        deleted_item = response.get('Attributes')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'message': 'Audit run deleted successfully',
                'deletedAuditRun': deleted_item
            })
        }

    except table.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({'error': 'Audit run not found'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({'error': f'Deletion failed: {str(e)}'})
        }
