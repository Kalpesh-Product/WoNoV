import React from 'react'

const DangerButton = ({title, handleSubmit, type, fontSize, externalStyles}) => {
  return (
    <div>
      <button type={type} className={`px-8 py-2 bg-red-200 text-red-600 rounded-md ${fontSize ? fontSize : "text-content leading-5" } ${externalStyles}`} onClick={handleSubmit}>
        {title}
      </button>
    </div>
  )
}

export default DangerButton
