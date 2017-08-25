const AWS = require('aws-sdk')
const util = require('util')

const ddb = new AWS.DynamoDB.DocumentClient()

/**
 * Convert JS Date timestamp to array of needed DynamoDB date properties
 * 
 * @param {integer} timestamp 
 */
function dimensions(timestamp) {
  const date = new Date(timestamp)
  const metricList = ['YEAR', 'MONTH', 'DATE', 'HOUR', 'MINUTE']
  
  const split = {
    Year: date.getUTCFullYear(),
    Month: date.getUTCMonth() >= 10 ? (date.getUTCMonth() + 1) : ('0' + (date.getUTCMonth() + 1)),
    Date: date.getUTCDate() >= 10 ? date.getUTCDate() : ('0' + date.getUTCDate()),
    Hour: date.getUTCHours() >= 10 ? date.getUTCHours() : ('0' + date.getUTCHours()),
    Minute: date.getUTCMinutes() >= 10 ? date.getUTCMinutes() : ('0' + date.getUTCMinutes())
  }

  const dateString = util.format('%s-%s-%sT%s:%s', split.Year, split.Month, split.Date, split.Hour, split.Minute)

  const dateList = []
  while (metric = metricList.pop()) {
    dateList.push(
      util.format('%s:%s', metric, dateString.substr(0, 3 * metricList.length + 4))
    )
  }

  return dateList
}

/**
 * Update counter value in DynamoDB
 * 
 * @return {Promise}
 */
function update (data) {
  const id = util.format('%s:%s', data.website, data.url)

  if (data && data.url) {
    return Promise.all(
      dimensions(data.date).map(
        date => ddb.update(
          {
            "TableName" : process.env.DYNAMODB_TABLE_NAME,
            "Key": { "id": id, "date": date },
            "UpdateExpression" : "ADD #value :inc SET #name = :name",
            "ExpressionAttributeNames" : { "#value" : "value", "#name" : "name" },
            "ExpressionAttributeValues": { ":inc" : 1 , ":name": data.name },
          }
        ).promise()
      )
    )
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
