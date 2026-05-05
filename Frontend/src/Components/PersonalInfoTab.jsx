/* eslint-disable no-unused-vars */
import { useState, useEffect, useContext } from "react";
import axios from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function PersonalInfoTab() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [profilePic, setProfilePic] = useState(user.profilePic);

  const handleProfileUpdate = async () => {
    const res = await axios.put("/user/profile", { name, email, phone });
    setUser(res.data.user);
    alert("Profile updated");
  };

  const handlePasswordChange = async () => {
    const oldPassword = prompt("Enter old password");
    const newPassword = prompt("Enter new password");
    await axios.post("/user/change-password", { oldPassword, newPassword });
    alert("Password updated");
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <img src={profilePic || "/default.png"} alt="profile" width={100} />
      <input type="file" onChange={handleProfilePic} />
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={handleProfileUpdate}>Update Profile</button>
        <button onClick={handlePasswordChange}>Change Password</button>
      </div>
    </div>
  );
}