// AWS Amplify configuration
// Auto-generated from CloudFormation outputs on 2025-10-21T21:16:28.997Z
// Environment: dev

const awsmobile = {
  "aws_project_region": "us-west-2",
  "aws_cognito_region": "us-west-2",
  "aws_user_pools_id": "us-west-2_j2tNzkpUv",
  "aws_user_pools_web_client_id": "3pjv0uckj9p9k5l7au4q9gn635",
  "oauth": {},
  "aws_cognito_username_attributes": [
    "EMAIL"
  ],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": [
    "EMAIL",
    "NAME"
  ],
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
  "aws_cognito_verification_mechanisms": [
    "EMAIL"
  ],
  "aws_appsync_graphqlEndpoint": "",
  "aws_appsync_region": "us-west-2",
  "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS"
};

export default awsmobile;
