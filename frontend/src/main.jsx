import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import App from './App'
import './index.css'

const client = new ApolloClient({
  // With the Vite proxy, /graphql is forwarded to Django at localhost:8000.
  // In production, replace with the absolute URL of your Django server.
  uri: '/graphql/',
  cache: new InMemoryCache({
    typePolicies: {
      CourseType: {
        // Use the course code as the cache key so Apollo normalises shared
        // nodes (e.g. MAT137Y1 appearing as prereq of multiple courses)
        // into a single cache entry.
        keyFields: ['code'],
      },
    },
  }),
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
