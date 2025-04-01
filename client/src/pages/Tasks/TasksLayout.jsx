import React from 'react'
import { Outlet } from 'react-router-dom'

const TasksLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default TasksLayout
