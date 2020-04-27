const amqp = require('amqplib/callback_api');

let ch = null;

var queue = 'benchmark';

amqp.connect('amqp://54.198.246.75:5672', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    channel.assertQueue(queue, {
      durable: false
    });
    ch = channel;
  });
});

function send(body) {
  return new Promise( (resolve, reject) => {
    const msg = JSON.stringify(body);
    const response = ch.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
    console.log("res: " + response);
    (response) ? resolve(true) : reject(false);
  });
}

function get() {
  console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

  ch.consume(queue, function (msg) {
    console.log(" [x] Received %s", msg.content.toString());
  }, {
    noAck: true
  });

  return Promise.resolve(true);
}

module.exports = {
  send,
  get,
}