const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

/**
 * Update counter value in DynamoDB
 * 
 * @return {Promise}
 */
function update (data) {
  if (data && data.url) {
    return ddb.update(
      {
        "TableName" : process.env.DYNAMODB_TABLE_NAME,
        "Key": { "url": data.url },
        "UpdateExpression" : "ADD #value :inc SET #name = :name",
        "ExpressionAttributeNames" : { "#value" : "value", "#name" : "name" },
        "ExpressionAttributeValues": { ":inc" : 1 , ":name": data.name },
      }
    ).promise()
  }

  return Promise.resolve()
}

/**
 * Lambda function that receives events from Kinesis
 *
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 * @return {Promise}
 */
function run (event, context, callback) {
  const data = event.Records || []

  // Create Promise for every received event
  const list = data.map(
    item => {
      const buff = Buffer(item.kinesis.data, 'base64').toString('ascii')

      try {
        return update(JSON.parse(buff))
      } catch (error) {
        // Ignore invalid data
        return Promise.resolve()
      }
    }
  )

  // Wait until all Promises resolve and execute callback 
  return Promise.all(
    list
  ).then(
    res => callback(null, { done: true, num: list.length })
  )
}

module.exports = { run }
