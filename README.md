For this I'm not using the pulumi state service. Instead initialize the backend on S3.  Configure your default profile to point at the account with your bucket and type: 

`pulumi login --cloud-url s3://name-of-s3-bucket`

then you need to set a value in the pulumi configuration for the SecretMessage value.  This is configured within your state file:

`pulumi config set --secret secretMessage "Look mom, I'm a secret"`

Now run the following:

`pulumi up`