import * as list from '../list'

function get(event, context, callback): void {
  list.get(null, null, (error, data) => {
    if (error) {
      return callback(error)
    }

    callback(null, {
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 200
    })
  })
}

module.exports = { get }
