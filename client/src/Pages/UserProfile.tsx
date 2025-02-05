import React, { useEffect, useState } from "react";
import AddTour from "../Components/Tour/AddTour";
import FavouritTour from "../Components/Tour/FavouritTour";
import EditUserForm from "../Components/UserProfile/EditUserForm";
import ListOfUserTours from "../Components/UserProfile/ListOfUserTours";
import { useAuth } from "../context/AuthContext";
import { EditableUser } from "../types/allTypes";

const UserProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const [profileActive, setProfileActive] = useState("profile");

  const [formData, setFormData] = useState<EditableUser & { repeatPassword?: string; profileImage?: string }>({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    repeatPassword: "",
    profileImageFile: null,
    profileImage: user?.profileImage || "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImageFile: file,
        profileImage: "",
      }));
    }
  };

  const handleDefaultImageSelect = (img: string) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: `/asserts/images/profilePictures/${img}`,
      profileImageFile: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordEntered = formData.password || formData.repeatPassword;
    if (passwordEntered) {
      if (formData.password !== formData.repeatPassword) {
        alert("Both password fields must be filled with the same value");
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name || "");
    formDataToSend.append("email", formData.email || "");

    if (passwordEntered && formData.password) {
      formDataToSend.append("password", formData.password);
    }
    if (formData.profileImageFile) {
      formDataToSend.append("profileImage", formData.profileImageFile);
    } else if (formData.profileImage) {
      formDataToSend.append("profileImage", formData.profileImage);
    }

    try {
      const response = await fetch("/user", {
        method: "PUT",
        credentials: "include",
        body: formDataToSend,
      });
      const data = await response.json();
      if (!response.ok) {
        alert("Update failed: " + (data.error || data.message));
      } else {
        alert("Profile updated successfully");
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred");
    }
  };

  const profileOnClick = () => setProfileActive("profile");
  const tourOnClick = () => setProfileActive("tour");
  const addTourOnClick = () => setProfileActive("add-tour");
  const favouritOnClick = () => setProfileActive("favourit");

  return (
    <div className="grid grid-cols-[20%_80%] px-15 h-full">
      <div className="bg-[#38436C] py-5 text-white flex flex-col gap-5 justify-start items-center">
        <h1 className="text-xl">User Profile</h1>
        <h2 className="text-lg">{user?.name}</h2>
        <div className="w-30 bg-gray-200 p-2 rounded-full border-8 border-blue-300">
          <img
            src={user?.profileImage || "/asserts/images/profilePictures/default-profile-picture.png"}
            alt="user profile pic"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="email flex flex-col items-center ">
          <h1>{user?.email}</h1>
        </div>

        <div className="menu mt-10 flex flex-col w-full pl-[20%]">
          {/* Profile Information Tab */}
          <div
            className={`w-full flex flex-row gap-5 px-2 py-3 cursor-pointer  ${profileActive === "profile" ? "text-white" : "text-blue-200"
              } `}
            onClick={profileOnClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <p>Personal Information</p>
          </div>

          {/* Shared Tour Tab */}
          <div
            className={`w-full flex flex-row gap-5 px-2 py-3 text-blue-200 cursor-pointer ${profileActive === "tour" ? "text-white" : "text-blue-200"
              }`}
            onClick={tourOnClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
              />
            </svg>
            <p>Shared Tours</p>
          </div>


          {/* add Tour Tab */}
          <div
            className={`w-full flex flex-row gap-5 px-2 py-3 text-blue-200 cursor-pointer ${profileActive === "add-tour" ? "text-white" : "text-blue-200"
              }`}
            onClick={addTourOnClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>

            <p>add Tours</p>
          </div>

          {/* favourit Tour Tab */}
          <div
            className={`w-full flex flex-row gap-5 px-2 py-3 text-blue-200 cursor-pointer ${profileActive === "favourit" ? "text-white" : "text-blue-200"
              }`}
            onClick={favouritOnClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
              />
            </svg>
            <p>Favourit Tours</p>
          </div>
        </div>
      </div>

      <div className=" bg-gray-100 px-10 py-5">
        {/* edit user form   */}
        <EditUserForm
          profileActive={profileActive}
          handleSubmit={handleSubmit}
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          handleDefaultImageSelect={handleDefaultImageSelect}
        />

        {/* list of tour */}
        <ListOfUserTours profileActive={profileActive} />
        <AddTour profileActive={profileActive} />

        {/* list of favourit */}
        <FavouritTour profileActive={profileActive} />
      </div>
    </div>
  );
};

export default UserProfile;
