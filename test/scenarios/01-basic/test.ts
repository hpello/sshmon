import axios from 'axios'
import { assert } from 'chai'

const REQUEST_TIMEOUT = 5000

describe('sshmon', () => {
  it('access local forwarded service', async () => {
    const url = 'http://localhost:1234/hello'
    const response = await axios.request({ url, timeout: REQUEST_TIMEOUT })
    assert.equal(response.status, 200)
    assert.equal(response.data, 'Hello from server\n')
  })

  it('access http forwarded service', async () => {
    const url = 'http://localhost:8377/proxy/server/http-forwarding/hello'
    const response = await axios.request({ url, timeout: REQUEST_TIMEOUT })
    assert.equal(response.status, 200)
    assert.equal(response.data, 'Hello from server\n')
  })
})
