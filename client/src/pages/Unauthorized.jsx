import { useNavigate } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import { useEffect } from "react";

const Unauthorized = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(-2, { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <MdLockOutline className="text-red-500 text-6xl mx-auto" />
        <h1 className="text-3xl font-bold text-gray-800 mt-4">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You do not have permission to view this page.
        </p>
        <p className="text-gray-500 mt-4 text-sm">
          Redirecting you back in <span className="font-medium">5 seconds</span>...
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate(-2)}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2.5 px-8 rounded-lg transition min-w-[140px]"
          >
            Go Back Now
          </button>
          {/* <button
            onClick={() => navigate("/app/dashboard")}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Redirecting you back...
          </button> */}
          {/* <button
            onClick={() => navigate("/app/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
