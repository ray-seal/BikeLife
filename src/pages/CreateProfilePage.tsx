import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

// Initialize Supabase client
const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const CreateProfilePage: React.FC = () => {
  const [name, setName] = useState("");
  const [dreamBike, setDreamBike] = useState("");
  const [currentBike, setCurrentBike] = useState("");
  const [licenceHeld, setLicenceHeld] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to create a profile.");
      setLoading(false);
      return;
    }

    // Insert into "profiles" table (make sure your table is named "profiles" and columns match)
    const { error: insertError } = await supabase.from("profiles").upsert(
      [
        {
          user_id: user.id, // assuming you have a user_id column as FK to auth.users
          name,
          dream_bike: dreamBike,
          current_bike: currentBike,
          licence_held: licenceHeld,
          location,
        },
      ],
      { onConflict: ["user_id"] }
    );

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Profile saved!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Create Your Profile</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Dream Bike"
          value={dreamBike}
          onChange={e => setDreamBike(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Current Bike"
          value={currentBike}
          onChange={e => setCurrentBike(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Licence Held"
          value={licenceHeld}
          onChange={e => setLicenceHeld(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}
      </form>
    </main>
  );
};
