// eslint-disable-next-line no-restricted-imports
import '../sass/main.scss'

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { APIClient } from './api/client'
import App from './components/App'
import { store } from './store'

const apiClient = new APIClient(store)

const Index = () => (
  <Provider store={store}>
    <App apiClient={apiClient} />
  </Provider>
)

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(<Index />)
