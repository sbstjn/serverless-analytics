const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const metricList = ['YEAR', 'MONTH', 'DATE', 'HOUR', 'MINUTE']

/**
 * Lambda function to get all items from DynamoDB
 *
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 * @return {Promise}
 */
function get (event, context, callback) {
  const metric = event.date.split(':').shift()
  const index = metricList.indexOf(metric)
  const newDate = event.date.replace(metric, metricList[index+1])

  const props = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    FilterExpression: "#id = :id AND begins_with(#date, :date)",  
    ExpressionAttributeNames: {
      "#id": "id",
      "#date": "date"
    },
    ExpressionAttributeValues: {
      ":id": event.website + ':' + event.url,
      ":date": newDate
    }  
  }

  return ddb.scan(props).promise().then(
    data => data.Items || []
  ).then(
    list => list.sort(
      (a, b) => a.date < b.date ? -1 : 1
    )
  ).then(
    list => list.map(
      item => {
        item.url = item.id.split(':').slice(1).join(':')
        item.date = item.date.split(':').slice(1).join(':')

        delete item.id
        delete item.url
        delete item.name

        return item
      }
    )
  ).then(
    list => callback(null, list)
  )
}

module.exports = { get }
