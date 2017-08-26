import * as AWS from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()
const metricList = ['YEAR', 'MONTH', 'DATE', 'HOUR', 'MINUTE']
const TableName = process.env.DYNAMODB_TABLE_NAME || ''

export function get(event, context, callback) {
  const metric = event.date.split(':').shift()
  const index = metricList.indexOf(metric)
  const newDate = event.date.replace(metric, metricList[index + 1])

  const props = {
    ExpressionAttributeNames: {
      '#date': 'date',
      '#id': 'id'
    },
    ExpressionAttributeValues: {
      ':date': newDate,
      ':id': event.website + ':' + event.url
    },
    FilterExpression: '#id = :id AND begins_with(#date, :date)',
    TableName
  }

  ddb.scan(props).promise().then(
    (data: any) => data.Items || []
  ).then(
    (list: any) => list.sort(
      (a, b) => a.date < b.date ? -1 : 1
    )
  ).then(
    (list: any) => list.map(
      (item: any) => {
        item.url = item.id.split(':').slice(1).join(':')
        item.date = item.date.split(':').slice(1).join(':')

        delete item.id
        delete item.url
        delete item.name

        return item
      }
    )
  ).then(
    (list: any) => callback(null, list)
  )
}
