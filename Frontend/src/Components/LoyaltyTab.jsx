import React, { useContext } from "react";
import { ProfileContext } from "../Context/ProfileContext";

const LoyaltyTab = () => {
  const { loyalty } = useContext(ProfileContext);

  return (
    <div className="p-4">
      {!loyalty ? (
        <p>No loyalty data available.</p>
      ) : (
        <div className="space-y-2">
          <p>Total Points: {loyalty.points}</p>
          <p>Membership Level: {loyalty.level}</p>
          <p>Rewards Available: {loyalty.rewards?.length || 0}</p>
        </div>
      )}
    </div>
  );
};

export default LoyaltyTab;