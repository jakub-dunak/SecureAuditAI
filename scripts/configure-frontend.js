#!/usr/bin/env node

/**
 * Configures the frontend aws-exports.js with CloudFormation outputs
 * Usage: node scripts/configure-frontend.js <user-pool-id> <user-pool-client-id> [api-gateway-url] [region] [environment]
 */

const fs = require('fs');
const path = require('path');

const [,, userPoolId, userPoolClientId, apiGatewayUrl, region = 'us-west-2', environment = 'production'] = process.argv;

if (!userPoolId || !userPoolClientId) {
  console.error('Usage: node scripts/configure-frontend.js <user-pool-id> <user-pool-client-id> [api-gateway-url] [region] [environment]');
  process.exit(1);
}

const config = {
  "aws_project_region": region,
  "aws_cognito_region": region,
  "aws_user_pools_id": userPoolId,
  "aws_user_pools_web_client_id": userPoolClientId,
  "oauth": {},
  "aws_cognito_username_attributes": ["EMAIL"],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": ["EMAIL", "NAME"],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [],
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,
    "passwordPolicyCharacters": [
      "REQUIRES_LOWERCASE",
      "REQUIRES_UPPERCASE",
      "REQUIRES_NUMBERS",
      "REQUIRES_SYMBOLS"
    ]
  },
  "aws_cognito_verification_mechanisms": ["EMAIL"],
  "aws_appsync_graphqlEndpoint": "",
  "aws_appsync_region": region,
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"
};

const configContent = `// AWS Amplify configuration
// Auto-generated from CloudFormation outputs on ${new Date().toISOString()}
// Environment: ${environment}

const awsmobile = ${JSON.stringify(config, null, 2)};

export default awsmobile;
`;

// Create a production environment configuration file
let envConfig = `# Production Environment Configuration
# Auto-generated on ${new Date().toISOString()}

REACT_APP_AWS_REGION=${region}
REACT_APP_USER_POOL_ID=${userPoolId}
REACT_APP_USER_POOL_CLIENT_ID=${userPoolClientId}
REACT_APP_ENVIRONMENT=${environment}
REACT_APP_APP_NAME=SecureAuditAI
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=false
`;

if (apiGatewayUrl) {
  envConfig += `REACT_APP_API_URL=${apiGatewayUrl}\n`;
}

// Write the environment configuration file
const envPath = path.join(__dirname, '..', 'frontend', '.env.production');
fs.writeFileSync(envPath, envConfig);

const configPath = path.join(__dirname, '..', 'frontend', 'src', 'aws-exports.js');
fs.writeFileSync(configPath, configContent);

console.log('✅ Frontend configuration updated successfully!');
console.log(`   User Pool ID: ${userPoolId}`);
console.log(`   Client ID: ${userPoolClientId}`);
console.log(`   Region: ${region}`);
if (apiGatewayUrl) {
  console.log(`   API Gateway URL: ${apiGatewayUrl}`);
}
