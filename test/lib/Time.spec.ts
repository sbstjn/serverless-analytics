import * as assert from 'assert'
import * as using from 'jasmine-data-provider'
import * as util from 'util'

import Time from '../../src/lib/Time'

describe('Time', () => {
  describe('dimension()', () => {
    const data = [
      { value: '2017', expected: 'YEAR' },
      { value: '2017-08', expected: 'MONTH' },
      { value: '2017-08-21', expected: 'DATE' },
      { value: '2017-08-21T12', expected: 'HOUR' },
      { value: '2017-08-21T12:45', expected: 'MINUTE' }
    ]

    using(data, item => {
      const name = util.format('detects %s as %s', item.value, item.expected)

      it(name, () => {
        const t = new Time(item.value)
    
        assert.equal(t.dimension(), item.expected)
      })
    })
  })
})