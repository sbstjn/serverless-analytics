import * as AWS from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()

export function get(e: LambdaHttpEvent, c: any, cb: any): void {
  const query = e.queryStringParameters

  const website = query.website || ''
  const date = query.date || ''

  ddb.scan(
    {
      ExpressionAttributeNames: {
        '#date': 'date',
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':date': date,
        ':website': website
      },
      FilterExpression: 'begins_with(#id, :website) AND begins_with(#date, :date)',
      TableName: process.env.DYNAMODB_TABLE_NAME || ''
    }
  ).promise().then(
    (data: any) => data.Items || []
  ).then(
    (list: DynamoDBItem[]) => list.sort(
      (a: DynamoDBItem, b: DynamoDBItem) => a.value > b.value ? -1 : 1
    )
  ).then(
    (list: DynamoDBItem[]) => list.map(
      (item: DynamoDBItem) => ({
        name: item.name,
        url: item.id.split(':').slice(1).join(':'),
        value: parseInt(item.value, 10)
      })
    )
  ).then(
    (list: RankingItem[]) => cb(null, {
      body: JSON.stringify(list),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 200
    })
  )
}
