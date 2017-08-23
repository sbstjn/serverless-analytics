const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

/**
 * Lambda function to get all items from DynamoDB
 *
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 * @return {Promise}
 */
function get (event, context, callback) {
  return ddb.scan({
    TableName: process.env.DYNAMODB_TABLE_NAME
  }).promise().then(
    data => data.Items || []
  ).then(
    list => list.sort(
      (a, b) => a.value > b.value ? -1 : 1
    )
  ).then(
    list => callback(null, list)
  )
}

module.exports = { get }
