declare interface EventData {
  website: string
  url: string
  date: number
  name: string
}

declare interface DynamoDBItem {
  value: string
  id: string
  name: string
  date: string
}

declare interface KinesisItem {
  kinesis: {
    data: string
  }
}

declare interface KinesisEvent {
  Records: KinesisItem[]
}

declare interface LambdaHttpEvent {
  queryStringParameters: {
    website?: string
    date?: string
    url?: string
  }
}

declare interface RankingItem {
  url: string
  value: number
}

declare interface SeriesItem {
  date: string
  url: string
  value: number
}