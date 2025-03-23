import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Invitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]); // ✅ Default to an empty array

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/invites/${user.uid}`);

        console.log("🔹 Backend Response:", data);

        if (data.receivedInvites && Array.isArray(data.receivedInvites)) {
          setInvitations(data.receivedInvites);
        } else {
          console.error("❌ Invalid response format:", data);
          setInvitations([]);
        }
      } catch (error) {
        console.error("❌ Error fetching invitations:", error);
        setInvitations([]);
      }
    };

    fetchInvitations();
  }, [user]);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-teal-400">Invitations</h2>

      {invitations.length === 0 ? (
        <p className="text-gray-400">No invitations received.</p>
      ) : (
        <ul className="list-disc pl-4">
          {invitations.map((invite) => (
            <li key={invite._id} className="mt-2">
              <strong className="text-teal-400">{invite.senderName}</strong> invited you for a{" "}
              {invite.type}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Invitations;
