const AWS = require('aws-sdk');
const http = require('http');
const https = require('https');

AWS.config.update({ region: 'us-east-1' });

const lambda = new AWS.Lambda();

// Increase the max sockets so Lambda will fulfill more requests in parallel
const agentConfig = { maxSocket: 1000 };
const agent = process.env.IS_OFFLINE 
  ? new http.Agent(agentConfig)
  : new https.Agent(agentConfig);

exports.handler = async (event, context) => {
  
  const tasks = Array.from(Array(5)).map(() => { 
    const process = async () => {
      const result = await lambda.invoke({
        FunctionName: 'check-stock-service-dev-crawlerWorkerFunction'
      }).promise();

      // console.log(result);
    };

    return process();
  });

  await Promise.all(tasks);
};