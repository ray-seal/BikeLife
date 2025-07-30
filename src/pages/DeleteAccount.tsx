import React, { useState } from "react";

const EMAIL_TO_NOTIFY = "bike-life1@outlook.com";
const SUBJECT = encodeURIComponent("delete my account on RideNet");

export default function DeleteAccount() {
  const [userEmail, setUserEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const isConfirmed = confirmation === "delete-my-account";
  const mailtoLink = `mailto:${EMAIL_TO_NOTIFY}?subject=${SUBJECT}&body=${encodeURIComponent(
    `Please delete my account associated with this email: ${userEmail}`
  )}`;

  return (
    <div className="delete-account-container" style={{ maxWidth: 500, margin: "0 auto", padding: "2rem" }}>
      <h2>Delete Your Account</h2>
      <form>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirmation">
            Type <b>delete-my-account</b> to confirm:
          </label>
          <input
            id="confirmation"
            type="text"
            required
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            style={{ display: "block", width: "100%", padding: "0.5rem" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
        <a
          href={isConfirmed && userEmail ? mailtoLink : "#"}
          onClick={e => {
            if (!userEmail) {
              e.preventDefault();
              setError("Please enter your email address.");
            } else if (!isConfirmed) {
              e.preventDefault();
              setError("Please type 'delete-my-account' exactly to confirm.");
            } else {
              setError("");
            }
          }}
          style={{
            display: "inline-block",
            padding: "0.5rem 1.5rem",
            background: isConfirmed && userEmail ? "#d32f2f" : "#aaa",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            pointerEvents: isConfirmed && userEmail ? "auto" : "none",
            cursor: isConfirmed && userEmail ? "pointer" : "not-allowed"
          }}
        >
          Send Account Deletion Email
        </a>
      </form>
      <p style={{ marginTop: "2rem", color: "#666" }}>
        This link will open your email client with the subject <b>"delete my account on RideNet"</b> pre-filled, and send to <b>{EMAIL_TO_NOTIFY}</b>.
      </p>
    </div>
  );
}
