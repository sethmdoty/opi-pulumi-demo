import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { secret } from "@pulumi/pulumi";

// Create a KMS Key for S3 server-side encryption
const key = new aws.kms.Key("my-key");

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("seth-doty-opi-pulumi-bucket", {
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "aws:kms",
                kmsMasterKeyId: key.id,
            }
        }
    }
});

// Export the name of the bucket
export const bucketName = bucket.id;

// Create a SNS Topic
const demoTopic = new aws.sns.Topic("seth-pulumi-demo-topic", {});

//Connect a bucket notification to our SNS topic
const bucketNotification = new aws.s3.BucketNotification("eventNotification", {
    bucket: bucket.id,
    topics: [{
        events: ["s3:ObjectCreated:*"],
        topicArn: demoTopic.arn
    }]
})

//Initialize the pulumi Configuration
const cfg = new pulumi.Config()
// Configure a reference to your message value in our pulumi Configuration.  Created with `pulumi config set --secret secretMessage "Look mom, I'm a secret"`
const secretMessage = cfg.requireSecret("secretMessage")
// Add the value of secretMessage to aws SSM
const secretParam = new aws.ssm.Parameter("secretParameter", {
    type: "SecureString",
    value: secretMessage.apply(s => s.toUpperCase())
});

//Export these values from our state during the pulumi up command
exports.topicArn = demoTopic.arn
exports.kmsarn = key.arn
exports.secretId = secretParam.id
exports.secretValue = secretParam.value

//I like Magic Functions More Lets make one of those

// Create our bucket.
const docsBucket = new aws.s3.Bucket("seth-doty-opi-pulumi-magic-bucket", {
    serverSideEncryptionConfiguration: {
        rule: {
            applyServerSideEncryptionByDefault: {
                sseAlgorithm: "aws:kms",
                kmsMasterKeyId: key.id,
            }
        }
    }
});

// Create an AWS Lambda event handler via magic functions.
docsBucket.onObjectCreated("docsHandler", (e) => {
    for (const rec of e.Records || []) {
        const [buck, key] = [rec.s3.bucket.name, rec.s3.object.key];
        console.log(`I'm magical -- I got an S3 Object: ${buck}/${key}`)
    }
});

// Export the bucket name so it's easy to access.
exports.docsBucketName = docsBucket