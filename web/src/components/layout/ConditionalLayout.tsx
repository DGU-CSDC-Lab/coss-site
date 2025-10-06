import { useLocation, Outlet } from 'react-router-dom'
import Layout from './Layout'

export default function ConditionalLayout() {
  const location = useLocation()
  const isAdminCreatePage = location.pathname.startsWith('/admin/') && 
    (location.pathname.endsWith('/create') || location.pathname.includes('/bulk-upload'))

  if (isAdminCreatePage) {
    return <Outlet />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
