

const SecondaryButton = ({title, handleSubmit, type}) => {
  return (
    <div>
      <button type={type} className=' px-8 py-2 bg-gray-300 text-black rounded-md text-content' onClick={handleSubmit}>
        {title}
      </button>
    </div>
  )
}

export default SecondaryButton
