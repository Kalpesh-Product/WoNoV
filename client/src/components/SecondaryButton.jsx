import React from 'react'

const SecondaryButton = ({title, handleSubmit, type, externalStyles}) => {
  return (
    <div>
      <button type={type} className={`px-8 py-2 bg-gray-300 text-black rounded-md text-content  ${externalStyles}`} onClick={handleSubmit}>
        {title}
      </button>
    </div>
  )
}

export default SecondaryButton
