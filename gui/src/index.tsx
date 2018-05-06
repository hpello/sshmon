import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import App from './components/App'
import { store } from './store'
import { APIClient } from './api/client'

const apiClient = new APIClient(store)

const Index = (
  <Provider store={store}>
    <App apiClient={apiClient} />
  </Provider>
)

ReactDOM.render(Index, document.getElementById('root'))
