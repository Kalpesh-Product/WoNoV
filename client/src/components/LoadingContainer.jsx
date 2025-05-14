import { CircularProgress } from '@mui/material'
import React from 'react'

const LoadingContainer = ({height}) => {
  return (
    <div className={`w-full flex items-center justify-center ${height ? height : "40vh"}`}>
      <CircularProgress />
    </div>
  )
}

export default LoadingContainer
