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
  const props = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    FilterExpression: "begins_with(#id, :website) AND begins_with(#date, :date)",  
    ExpressionAttributeNames: {
      "#id": "id",
      "#date": "date"
    },
    ExpressionAttributeValues: {
      ":website": event.website,
      ":date": event.date
    }  
  }

  return ddb.scan(props).promise().then(
    data => data.Items || []
  ).then(
    list => list.sort(
      (a, b) => a.value > b.value ? -1 : 1
    )
  ).then(
    list => list.map(
      item => {
        item.url = item.id.split(':').slice(1).join(':')

        delete item.id
        delete item.date

        return item
      }
    )
  ).then(
    list => callback(null, list)
  )
}

module.exports = { get }
