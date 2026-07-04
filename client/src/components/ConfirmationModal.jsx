import MuiModal from "./MuiModal";
import PrimaryButton from "./PrimaryButton";

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = "Delete Record",
  message = "Are you sure you want to delete this record?",
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
}) => {
  return (
    <MuiModal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-left text-content text-gray-700">{message}</p>
        <div className="flex justify-center gap-3">
          <PrimaryButton
            title={confirmText}
            handleSubmit={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            padding="px-5 py-1.5"
          />
          <PrimaryButton
            title={cancelText}
            handleSubmit={onClose}
            disabled={isLoading}
            externalStyles="!bg-gray-500"
            padding="px-5 py-1.5"
          />
        </div>
      </div>
    </MuiModal>
  );
};

export default ConfirmationModal;
