import * as AWS from 'aws-sdk'
import * as  util from 'util'

const ddb = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.DYNAMODB_TABLE_NAME || ''

function dimensions(timestamp: number): string[] {
  const date = new Date(timestamp)
  const metricList = ['YEAR', 'MONTH', 'DATE', 'HOUR', 'MINUTE']

  const split = {
    Date: date.getUTCDate() >= 10 ? date.getUTCDate() : ('0' + date.getUTCDate()),
    Hour: date.getUTCHours() >= 10 ? date.getUTCHours() : ('0' + date.getUTCHours()),
    Minute: date.getUTCMinutes() >= 10 ? date.getUTCMinutes() : ('0' + date.getUTCMinutes()),
    Month: date.getUTCMonth() >= 10 ? (date.getUTCMonth() + 1) : ('0' + (date.getUTCMonth() + 1)),
    Year: date.getUTCFullYear()
  }

  const dateString = util.format('%s-%s-%sT%s:%s', split.Year, split.Month, split.Date, split.Hour, split.Minute)

  const dateList: string[] = []
  while (metricList.length > 0) {
    const metric = metricList.pop()

    dateList.push(util.format('%s:%s', metric, dateString.substr(0, 3 * metricList.length + 4)))
  }

  return dateList
}

interface EventData {
  website: string
  url: string
  date: number
  name: string
}

function update(data: EventData): Promise<any> {
  const id = util.format('%s:%s', data.website, data.url)

  if (data && data.url) {
    return Promise.all(
      dimensions(data.date).map(
        (date: string) => ddb.update(
          {
            ExpressionAttributeNames : { '#value': 'value', '#name': 'name' },
            ExpressionAttributeValues: { ':inc': 1, ':name': data.name },
            Key: { id, date },
            TableName,
            UpdateExpression: 'ADD #value :inc SET #name = :name'
          }
        ).promise()
      )
    )
  }

  return Promise.resolve()
}

export function run(event: any, context: any, callback: any): void {
  const data = event.Records || []

  // Create Promise for every received event
  const list = data.map(
    (item: any) => {
      const buff = new Buffer(item.kinesis.data, 'base64').toString('ascii')

      try {
        return update(JSON.parse(buff))
      } catch (error) {
        // Ignore invalid data
        return Promise.resolve()
      }
    }
  )

  // Wait until all Promises resolve and execute callback
  Promise.all(
    list
  ).then(
    (res: any) => callback(null, { done: true, num: list.length })
  )
}
