import { useParams } from "react-router-dom";
import VoucherForm from "../Templates/VoucherForm";

const FinanceViewVoucher = () => {
  const { id } = useParams();

  // Map template IDs to their components
  const templateComponents = {
    1: <VoucherForm />,
  };

  return <div>{templateComponents[id] || <p>Template not found</p>}</div>;
};

export default FinanceViewVoucher;
