import { useState, useEffect } from "react";

const empty = {
  name: "",
  amount: "",
  billingCycle: "Monthly",
  renewalDate: "",
  category: "Other",
};

export default function SubscriptionForm({ onSubmit, existing, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (existing) {
      setForm({
        ...existing,
        renewalDate: existing.renewalDate?.slice(0, 10),
      });
    }
  }, [existing]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(empty);
  };

  return (
    <form className="sub-form" onSubmit={handleSubmit}>
      <input name="name" placeholder="Service name (e.g. Netflix)" value={form.name} onChange={handleChange} required />
      <input name="amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={handleChange} required />

      <select name="billingCycle" value={form.billingCycle} onChange={handleChange}>
        <option>Monthly</option>
        <option>Yearly</option>
        <option>Weekly</option>
      </select>

      <select name="category" value={form.category} onChange={handleChange}>
        <option>Entertainment</option>
        <option>Work</option>
        <option>Health</option>
        <option>Education</option>
        <option>Other</option>
      </select>

      <input name="renewalDate" type="date" value={form.renewalDate} onChange={handleChange} required />

      <div className="form-buttons">
        <button type="submit">{existing ? "Update" : "Add Subscription"}</button>
        {onCancel && <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}