import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [value, setValue] = useState({ address: "", mobile: "" });
  const [profileData, setProfileData] = useState({});

  const headers = {
    id: localStorage.getItem("id"),
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // Handle input change
  const change = (e) => {
    const { name, value: val } = e.target;

    // Allow ONLY numbers for mobile + max 10 digits
    if (name === "mobile") {
      if (/^\d*$/.test(val) && val.length <= 10) {
        setValue((prev) => ({ ...prev, mobile: val }));
      }
      return;
    }

    setValue((prev) => ({ ...prev, [name]: val }));
  };

  // Update Address
  const updateAddress = async () => {
    const response = await axios.put(
      "http://localhost:3000/api/v1/updateaddress",
      { address: value.address },
      { headers }
    );
    alert(response.data.message);
  };

  // Update Mobile Number
  const updateMobile = async () => {
    if (value.mobile.length !== 10) {
      alert("Mobile number must be exactly 10 digits");
      return;
    }

    const response = await axios.put(
      "http://localhost:3000/api/v1/updatemobile",
      { mobile: value.mobile },
      { headers }
    );
    alert(response.data.message);
  };

  // Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get(
        "http://localhost:3000/api/v1/getuserinfo",
        { headers }
      );

      setValue({
        address: response.data.data.address,
        mobile: response.data.data.mobile,
      });

      setProfileData(response.data.data);
    };

    fetchUser();
  }, []);

  return (
    <div className="bg-zinc-900 min-h-screen w-full p-6 flex justify-center items-start text-white">
      <div className="w-full max-w-3xl bg-zinc-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center border-b border-zinc-700 pb-4">
          User Settings
        </h1>

        <div className="space-y-6">
          {/* Username */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">Username</h2>
            <p className="text-zinc-400">{profileData.username}</p>
          </div>

          {/* Email */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">Email</h2>
            <p className="text-zinc-400">{profileData.email}</p>
          </div>

          {/* Address Update Section */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">Address</h2>
            <textarea
              className="text-zinc-400 bg-zinc-700 p-2 rounded-md w-full min-h-[100px]"
              onChange={change}
              name="address"
              value={value.address}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={updateAddress}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Update Address
            </button>
          </div>

          {/* Mobile Update Section */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">
              Mobile Number
            </h2>
            <input
              type="text"
              className="text-zinc-400 bg-zinc-700 p-2 rounded-md w-full"
              name="mobile"
              value={value.mobile}
              onChange={change}
              placeholder="Enter 10-digit mobile number"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={updateMobile}
              className="bg-yellow-500 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Update Mobile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
