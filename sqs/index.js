var AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const QueueUrl = "https://sqs.us-east-1.amazonaws.com/021211125129/benchmark";

function getParams(body) { 
  var params = {
    DelaySeconds: 10,
    MessageAttributes: {
      "Author": {
        DataType: "String",
        StringValue: "andmagom"
      }
    },
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageId: "Group1",  // Required for FIFO queues
    QueueUrl,
  };

  params.MessageBody = JSON.stringify(body);
  return params;
}



function send(body) {
  const params = getParams(body);
  return new Promise( ( resolve, reject ) => {
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log("Error", err);
        reject(err);
      } else {
        console.log("Success", data.MessageId);
        resolve(data.MessageId);
      }
    });
  } ); 
}

var params2 = {
  AttributeNames: [
     "SentTimestamp"
  ],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: [
     "All"
  ],
  QueueUrl,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0
 };

function get2() {
  const app = Consumer.create({
    queueUrl: QueueUrl,
    waitTimeSeconds: 0,
    batchSize: 10,
    handleMessageBatch: async (message) => {
      console.log(message)
    },
    sqs: new AWS.SQS()
  });
  
  app.on('error', (err) => {
    console.error(err.message);
  });
  
  app.on('processing_error', (err) => {
    console.error(err.message);
  });
  
  app.on('timeout_error', (err) => {
  console.error(err.message);
  });
  
  app.start();

  return Promise.resolve(true);
}

async function get() {
  setInterval( () => get3(), 50 ) ;
}

function get3() {
  return new Promise( (resolve, reject) => {
    sqs.receiveMessage(params2, function(err, data) {
      if (err) {
        console.log("Receive Error", err);
        return reject(false);
      } else if (data.Messages) {
        const arrayEntries = [];
        data.Messages.forEach(data => {
          //console.log("dataaa "+ JSON.stringify(data));
          const obj = {
              Id: data.MessageId,
              ReceiptHandle: data.ReceiptHandle /* required */
          };
          arrayEntries.push(obj);
        });
        var deleteParams = {
          QueueUrl,
          Entries: arrayEntries
        };
        console.log(data.Messages.length);
        sqs.deleteMessageBatch(deleteParams, function(err, data) {
          if (err) {
            console.log("Delete Error", err);
          } else {
            console.log("Message Deleted", data);
          }
        });
        resolve(true);
      }
    });
  });
}


module.exports = {
  send,
  get
}