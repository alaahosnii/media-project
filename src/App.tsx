import './App.css'
import Providers from './providers/Providers'
import { RouterProvider } from 'react-router-dom'
import routes from './routes/routes'

function App() {
  return (
    <Providers>
      <RouterProvider router={routes} />
    </Providers>
  )
}

export default App
