import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { toast } from "sonner";
import PrimaryButton from "./PrimaryButton";
import { useNavigate, useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import Abrar from "../assets/abrar.jpeg"

const AccessTree = ({clickState}) => {
  const location = useLocation();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const axios = useAxiosPrivate();
  const currentPath = location.pathname;

  useEffect(() => {
    console.log("Selected Users Stack: ", selectedUsers);
  }, [selectedUsers]);

  const fetchHierarchy = async () => {
    try {
      const response = await axios.get("/api/company/company-hierarchy");

      return response.data.generateHierarchy;
    } catch (error) {
      toast.error(error.message);
      throw new Error(error);
    }
  };

  const {
    data: hierarchy,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["hierarchy"],
    queryFn: fetchHierarchy,
  });

  const handleSelectUser = (user, level) => {
    setSelectedUsers((prev) => {
      const newPath = [...prev];
      newPath[level] = user; // Replace or set the user at this level
      return newPath.slice(0, level + 1); // Truncate everything beyond this level
    });
  };

  const handleBack = () => {
    setSelectedUsers((prev) => prev.slice(0, -1));
  };

  if (isPending) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${
          location.pathname.includes(currentPath) ? "h-full" : "min-h-screen"
        }  text-blue-900`}>
        <CircularProgress color="#1E3D73" />
        <p className="text-lg font-medium">Loading hierarchy...</p>
      </div>
    );
  }

  if (isError || !hierarchy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
        <svg
          className="w-10 h-10 mb-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.668 1.732-3L13.732 4c-.77-1.332-2.694-1.332-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z"></path>
        </svg>
        <p className="text-lg font-semibold">Failed to load hierarchy.</p>
        <p className="text-sm text-red-500 mt-1">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    // <div className="flex flex-col items-center p-6 pt-10 min-h-screen">
    <div className="flex flex-col items-center p-6 pt-10 min-h-[30vh]">
      <HierarchyCard
        user={hierarchy}
        handleSelectUser={(user) => handleSelectUser(user, 0)}
        isTopLevel={true}
        click={clickState}
      />

      {selectedUsers.map((user, index) => (
        <div
          key={user.empId}
          className="w-full mt-6 p-4 border-t border-gray-300 rounded-lg">
          <div className="flex items-center mb-10">
            <div className="w-[10%]">
              <PrimaryButton title={"Back"} handleSubmit={handleBack} />
            </div>
            <div className="w-full text-center">
              <span className="text-subtitle font-semibold mr-20">
                Subordinates of {user.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {user.subordinates.map((subordinate) => (
              <HierarchyCard
                key={subordinate.empId}
                user={subordinate}
                click={clickState}
                handleSelectUser={(user) => handleSelectUser(user, index + 1)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const HierarchyCard = ({ user, handleSelectUser, isTopLevel, click = true }) => {
  const navigate = useNavigate();

  const getInitials = (name) => {
    const names = name.trim().split(" ");
    const firstInitial = names[0]?.[0] || "";
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : "";
    return `${firstInitial}${lastInitial}`;
  };

  const isAbrar = user.email === "abrar@biznest.co.in";

  return (
    <div
      className={`bg-white flex flex-col shadow-md border border-gray-300 rounded-lg p-4 pt-0 px-0 text-center cursor-pointer relative w-60 transition ${
        isTopLevel ? "border-2 border-primary" : ""
      }`}
    >
      <div
        onClick={() => {click ? navigate("permissions", { state: { user } }) : ''} }
        className="bg-primary text-white p-2 pt-4 rounded-t-md"
      >
        <div className="w-full flex flex-col justify-center">
          <div className="absolute -top-7 left-[6rem] flex items-center justify-center text-black font-semibold border-default border-primary rounded-full w-12 h-12 bg-red-50 overflow-hidden">
            {isAbrar ? (
              <img src={Abrar} alt="Abrar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span>{getInitials(user.name)}</span>
            )}
          </div>
        </div>
        <span className="text-subtitle font-semibold">{user.name}</span>
      </div>
      <span className="text-content mt-2">
        {user.designation.length > 20
          ? user.designation.slice(0, 20) + "..."
          : user.designation}
      </span>
      <span className="text-small text-primary">{user.email}</span>

      {user.subordinates && user.subordinates.length > 0 && (
        <p
          onClick={() => handleSelectUser(user)}
          className="mt-2 text-xs text-gray-500 hover:underline"
        >
          {user.subordinates.length} Subordinate
          {user.subordinates.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};


export default AccessTree;
