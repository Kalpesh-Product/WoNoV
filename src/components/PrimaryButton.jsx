const PrimaryButton = ({
  title,
  handleSubmit,
  type,
  fontSize,
  externalStyles,
  disabled,
}) => {
  return (
    <div>
      <button
        disabled={disabled}
        type={type}
        className={`px-8 py-2 ${disabled ? "bg-gray-400" : 'bg-primary'} motion-preset-slide-up-sm  text-white rounded-md ${
          fontSize ? fontSize : "text-content leading-5"
        } ${externalStyles}`}
        onClick={handleSubmit}
      >
        {title}
      </button>
    </div>
  );
};

export default PrimaryButton;
