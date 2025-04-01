import React from 'react'

const GroupedButton = ({title, handleSubmit, type, fontSize, externalStyles}) => {
  return (
    <div>
      <button type={type} className={`px-8 py-2 bg-primary text-white rounded-md ${fontSize ? fontSize : "text-content" } ${externalStyles}`} onClick={handleSubmit}>
        {title}
      </button>
    </div>
  )
}

export default GroupedButton
