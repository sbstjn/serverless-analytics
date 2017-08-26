import * as AWS from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()
const series = ['YEAR', 'MONTH', 'DATE', 'HOUR', 'MINUTE']


export function get(e: any, c: any, cb: any) {
  const query = e.queryStringParameters

  const date = query.date || ''
  const website = query.website || ''
  const url = query.url || ''

  const metric = date.split(':').shift()
  const index = series.indexOf(metric)
  const newDate = date.replace(metric, series[index + 1])

  ddb.scan(
    {
      ExpressionAttributeNames: {
        '#date': 'date',
        '#id': 'id'
      },
      ExpressionAttributeValues: {
        ':date': newDate,
        ':id': website + ':' + url
      },
      FilterExpression: '#id = :id AND begins_with(#date, :date)',
      TableName: process.env.DYNAMODB_TABLE_NAME || ''
    }
  ).promise().then(
    (data: any) => data.Items || []
  ).then(
    (list: any) => list.sort(
      (a: any, b: any) => a.date < b.date ? -1 : 1
    )
  ).then(
    (list: any) => list.map(
      (item: any) => {
        item.url = item.id.split(':').slice(1).join(':')

        delete item.id
        delete item.url
        delete item.name

        return item
      }
    )
  ).then(
    (list: any) => cb(null, {
      body: JSON.stringify(list),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 200
    })
  )
}
