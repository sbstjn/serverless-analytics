/**
 * Wrap list function into a HTTP response
 *
 * @param {object} event 
 * @param {object} context 
 * @param {function} callback 
 * @return {Promise}
 */
function get (event, context, callback) {
  require('../list.js').get(null, null, (error, data) => {
    if (error) {
      return callback(error)
    }

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': "*"
      },
      body: JSON.stringify(data)
    })
  })
}

module.exports = { get }
