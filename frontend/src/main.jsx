import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Root from '@pages/Root'
import Error404 from '@pages/Error404'
import Login from '@pages/Login'
import Home from '@pages/Home'
import ProtectedRoute from '@components/ProtectedRoute'
import '@styles/styles.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: '/auth',
        element: <Login />
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
)