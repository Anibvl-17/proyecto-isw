import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Root from '@pages/Root'
import Error404 from '@pages/Error404'
import Login from '@pages/Login'
import Home from '@pages/Home'
import Inscription from '@pages/Inscription'
import ProtectedRoute from '@components/ProtectedRoute'
import '@styles/styles.css';
import Logout from '@pages/Logout'
import Users from '@pages/Users'
import Requests from '@pages/Requests'
import Electives from '@pages/Elective'
import Periodos from '@pages/Periodos'
import Profile from '@pages/Profile'

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
        path: "/auth",
        element: <Login />
      },
      {
        path: "/logout",
        element: <Logout />
      },
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )
      },
      {
        path: "/requests",
        element: (
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        )
      },
      {
        path: "/periodos",
        element: (
          <ProtectedRoute allowedRoles={["jefe_carrera", "administrador"]}>
            <Periodos />
          </ProtectedRoute>
        )
      },
      {
        path: "/electives",
        element: (
          <ProtectedRoute>
            <Electives />
          </ProtectedRoute>
        )
      },
      {
        path: "/users",
        element: (
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        )
      },
      {
        path: "/inscription",
        element: (
          <ProtectedRoute>
            <Inscription />
          </ProtectedRoute>
        )
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
)
