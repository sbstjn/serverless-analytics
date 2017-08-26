import * as AWS from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.DYNAMODB_TABLE_NAME || ''

export function get(event, context, callback): void {
  ddb.scan(
    { TableName }
  ).promise().then(
    (data: any) => data.Items || []
  ).then(
    (list: any) => list.sort(
      (a, b) => a.value > b.value ? -1 : 1
    )
  ).then(
    (list: any) => callback(null, list)
  )
}
