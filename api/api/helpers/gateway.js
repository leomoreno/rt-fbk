'use strict';

const uuidv4 = require('uuid/v4');
const config = require('config');
const Dynamite = require('dynamite');

let TABLE_NAME;
let DYNAMO_CLIENT;

exports.initGateWay = function() {
    if (!DYNAMO_CLIENT) {
      TABLE_NAME = config.get('DynamoDB.table');
      const dynamoSettings = config.get('DynamoDB');
      const options = {
        region: dynamoSettings.region,
        endpoint: dynamoSettings.endPoint,
        accessKeyId: dynamoSettings.accessKeyId,
        secretAccessKey: dynamoSettings.secretAccessKey
      };
      DYNAMO_CLIENT = new Dynamite.Client(options);
    }
}

exports.get = function(uuid, cb) {
    exports.initGateWay();
    return DYNAMO_CLIENT.getItem(TABLE_NAME)
        .setHashKey('uuid', uuid)
        .execute()
        .then(function(data) {
            // console.info(JSON.stringify(data, null, 2));
            cb(false, data.result);
        }).fail(function (e) {
            console.info(JSON.stringify(e, null, 2));
            cb(e);
        });
}

exports.post = function(feedback, cb) {
    exports.initGateWay();
    return DYNAMO_CLIENT.putItem(TABLE_NAME, feedback)
        .execute()
        .then(function(data) {
          // console.info(`Gateway::post::putItem::Success: ${JSON.stringify(data, null, 2)}`);
          return cb(false, data.result);
        })
        .fail(function(e) {
            console.info(`Gateway::post::putItem::Error: ${JSON.stringify(e, null, 2)}`);
            return cb(e);
        });
}

exports.put = function(args, cb) {
    exports.initGateWay();
    DYNAMO_CLIENT.putItem(TABLE_NAME, args)
      .execute()
      .then(function(updateData) {
        console.info(`Gateway::put::putItem::Success: ${JSON.stringify(updateData, null, 2)}`);
        cb(false, updateData.result);
      })
      .fail(function(e) {
          console.info(`Gateway::put::putItem::Error: ${JSON.stringify(e, null, 2)}`);
          console.info(JSON.stringify(e, null, 2));
          cb(e);
      });
}
