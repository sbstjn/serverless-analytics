import * as AWS from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.DYNAMODB_TABLE_NAME || ''

export function get(event, context, callback) {
  const props = {
    ExpressionAttributeNames: {
      '#date': 'date',
      '#id': 'id'
    },
    ExpressionAttributeValues: {
      ':date': event.date,
      ':website': event.website
    },
    FilterExpression: 'begins_with(#id, :website) AND begins_with(#date, :date)',
    TableName
  }

  ddb.scan(props).promise().then(
    (data: any) => data.Items || []
  ).then(
    (list: any) => list.sort(
      (a, b) => a.value > b.value ? -1 : 1
    )
  ).then(
    (list: any) => list.map(
      (item: any) => {
        item.url = item.id.split(':').slice(1).join(':')

        delete item.id
        delete item.date

        return item
      }
    )
  ).then(
    (list: any) => callback(null, list)
  )
}
