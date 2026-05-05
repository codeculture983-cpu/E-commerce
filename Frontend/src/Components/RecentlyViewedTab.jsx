// src/Pages/Tabs/RecentlyViewedTab.jsx
import React, { useContext } from "react";
import { ProfileContext } from "../Context/ProfileContext";
const RecentlyViewedTab = () => {
  const { recentlyViewed } = useContext(ProfileContext);

  if (!recentlyViewed.length) return <p>No recently viewed products.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recentlyViewed.map((item) => (
        <div key={item._id} className="border rounded p-4 flex items-center space-x-4">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-gray-500">${item.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentlyViewedTab;