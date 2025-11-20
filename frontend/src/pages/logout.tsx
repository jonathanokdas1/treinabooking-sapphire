import { useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'

const LogoutPage = () => {
  const auth = useAuth()

  useEffect(() => {
    auth.logout()
  }, [])

  return null
}

LogoutPage.guestGuard = true

export default LogoutPage