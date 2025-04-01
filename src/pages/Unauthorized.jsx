import { useNavigate } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <MdLockOutline className="text-red-500 text-6xl mx-auto" />
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You do not have permission to view this page.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/app/dashboard/HR-dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
