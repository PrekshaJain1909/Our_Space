import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleInvite = () => {
    navigate("/invite-partner");
  };

  if (!user) return null;

 return (
  <div>
    <h1>Welcome {user.name} 💖</h1>

    {/* If couple NOT active */}
    {!user.isActive && (
      <button onClick={handleInvite}>
        Invite Partner 💌
      </button>
    )}

    {/* If couple active */}
    {user.isActive && (
      <div>
        <h3>Couple Features Unlocked ✨</h3>
        <button>Create Love Note</button>
        <button>Shared Goals</button>
      </div>
    )}

    <button onClick={handleLogout}>Logout</button>
  </div>
);

}
