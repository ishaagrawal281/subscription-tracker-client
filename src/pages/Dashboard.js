import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import SubscriptionForm from "../components/SubscriptionForm";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const fetchSubs = async () => {
    const { data } = await API.get("/subscriptions");
    setSubscriptions(data);
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleAdd = async (form) => {
    await API.post("/subscriptions", form);
    setShowForm(false);
    fetchSubs();
  };

  const handleUpdate = async (form) => {
    await API.put(`/subscriptions/${editing._id}`, form);
    setEditing(null);
    fetchSubs();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this subscription?")) {
      await API.delete(`/subscriptions/${id}`);
      fetchSubs();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const monthlyTotal = subscriptions
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => {
      if (s.billingCycle === "Yearly") return sum + s.amount / 12;
      if (s.billingCycle === "Weekly") return sum + s.amount * 4;
      return sum + s.amount;
    }, 0);

  const today = new Date();
  const upcoming = subscriptions.filter((s) => {
    const diff = (new Date(s.renewalDate) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <h1>📋 Subscription Tracker</h1>
        <div className="header-right">
          <button
            className="dark-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span>👤 {user?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <p>Total Active</p>
          <h3>{subscriptions.filter((s) => s.status === "Active").length}</h3>
        </div>
        <div className="stat-card">
          <p>Monthly Spend</p>
          <h3>₹{monthlyTotal.toFixed(2)}</h3>
        </div>
        <div className="stat-card">
          <p>Renewing Soon</p>
          <h3>{upcoming.length}</h3>
        </div>
      </div>

      {/* Upcoming Renewals */}
      {upcoming.length > 0 && (
        <div className="upcoming">
          <h3>⚠️ Renewing within 7 days</h3>
          {upcoming.map((s) => (
            <p key={s._id}>
              {s.name} — {new Date(s.renewalDate).toLocaleDateString()} — ₹{s.amount}
            </p>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="add-btn" onClick={() => { setShowForm(!showForm); setEditing(null); }}>
        {showForm ? "✕ Cancel" : "+ Add Subscription"}
      </button>

      {/* Add Form */}
      {showForm && <SubscriptionForm onSubmit={handleAdd} />}

      {/* Subscriptions List */}
      <div className="sub-list">
        {subscriptions.length === 0 && (
          <p className="empty">No subscriptions yet. Add one above!</p>
        )}
        {subscriptions.map((s) => (
          <div key={s._id} className="sub-card">
            {editing?._id === s._id ? (
              <SubscriptionForm
                existing={editing}
                onSubmit={handleUpdate}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="sub-info">
                  <h3>{s.name}</h3>
                  <span className="badge">{s.category}</span>
                  <span className={`badge ${s.status === "Active" ? "green" : "red"}`}>
                    {s.status}
                  </span>
                </div>
                <div className="sub-meta">
                  <p>₹{s.amount} / {s.billingCycle}</p>
                  <p>Renews: {new Date(s.renewalDate).toLocaleDateString()}</p>
                </div>
                <div className="sub-actions">
                  <button className="edit-btn" onClick={() => { setEditing(s); setShowForm(false); }}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(s._id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}