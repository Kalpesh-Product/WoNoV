import React from 'react'
import { Outlet } from 'react-router-dom'

const FrontendLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default FrontendLayout
