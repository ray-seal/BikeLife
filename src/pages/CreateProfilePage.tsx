import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const CreateProfilePage: React.FC = () => {
  const [name, setName] = useState("");
  const [dreamBike, setDreamBike] = useState("");
  const [currentBike, setCurrentBike] = useState("");
  const [licenceHeld, setLicenceHeld] = useState("");
  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Preview selected image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Get the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to create a profile.");
      setLoading(false);
      return;
    }

    let profilePicUrl: string | null = null;

    // Upload profile pic if one is selected
    if (profilePic) {
      const fileExt = profilePic.name.split('.').pop();
      const filePath = `profile-pictures/${user.id}-${Date.now()}.${fileExt}`;

      // Remove any existing file for this user (optional, upsert covers this)
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, profilePic, { upsert: true });

      if (uploadError) {
        setError("Failed to upload profile picture: " + uploadError.message);
        setLoading(false);
        return;
      }

      // Get a public URL for the uploaded file
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      profilePicUrl = data.publicUrl;
    }

    // Submit the profile data to the "profile" table
    const { error: insertError } = await supabase.from("profile").upsert(
      [
        {
          user_id: user.id,
          name,
          dream_bike: dreamBike,
          current_bike: currentBike,
          licence_held: licenceHeld,
          location,
          profile_pic_url: profilePicUrl,
        },
      ],
      { onConflict: "user_id" }
    );

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Profile saved!");
      setTimeout(() => {
        navigate("/");
      }, 1200);
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
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="Dream Bike"
          value={dreamBike}
          onChange={e => setDreamBike(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />
        <input
          type="text"
          placeholder="Current Bike"
          value={currentBike}
          onChange={e => setCurrentBike(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Licence Held"
          value={licenceHeld}
          onChange={e => setLicenceHeld(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border p-2 rounded text-black"
        />
        {/* Profile Picture Upload */}
        <label className="block font-medium">Profile Picture (optional):</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="border p-2 rounded bg-white text-black"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded mt-2 mb-2 border"
          />
        )}
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
