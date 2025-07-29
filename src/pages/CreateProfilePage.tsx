import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";


export const CreateProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dreamBike: "",
    currentBike: "",
    licenceHeld: "",
    location: "",
    profilePic: null as File | null,
    profilePicUrl: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to view your profile.");
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (fetchError) {
        setError("Could not fetch profile.");
        setLoading(false);
        return;
      }
      setProfile(data);
      setForm({
        name: data.name || "",
        dreamBike: data.dream_bike || "",
        currentBike: data.current_bike || "",
        licenceHeld: data.licence_held || "",
        location: data.location || "",
        profilePic: null,
        profilePicUrl: data.profile_pic_url || "",
      });
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // Preview selected image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, profilePic: file }));
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEditMode(true);
    setPreview(null); // reset preview
    setSuccess(null);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setForm({
      name: profile?.name || "",
      dreamBike: profile?.dream_bike || "",
      currentBike: profile?.current_bike || "",
      licenceHeld: profile?.licence_held || "",
      location: profile?.location || "",
      profilePic: null,
      profilePicUrl: profile?.profile_pic_url || "",
    });
    setPreview(null);
    setError(null);
    setSuccess(null);
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
      setError("You must be logged in to update your profile.");
      setLoading(false);
      return;
    }

    let profilePicUrl: string | null = form.profilePicUrl || null;

    // Upload profile pic if new one is selected
    if (form.profilePic) {
      const fileExt = form.profilePic.name.split('.').pop();
      const filePath = `profile-pictures/${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, form.profilePic, { upsert: true });
      if (uploadError) {
        setError("Failed to upload profile picture: " + uploadError.message);
        setLoading(false);
        return;
      }
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      profilePicUrl = data.publicUrl;
    }

    // Upsert the profile
    const { error: insertError } = await supabase.from("profile").upsert(
      [
        {
          user_id: user.id,
          name: form.name,
          dream_bike: form.dreamBike,
          current_bike: form.currentBike,
          licence_held: form.licenceHeld,
          location: form.location,
          profile_pic_url: profilePicUrl,
        },
      ],
      { onConflict: "user_id" }
    );

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Profile updated!");
      setProfile({
        user_id: user.id,
        name: form.name,
        dream_bike: form.dreamBike,
        current_bike: form.currentBike,
        licence_held: form.licenceHeld,
        location: form.location,
        profile_pic_url: profilePicUrl,
      });
      setEditMode(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <main className="p-4 max-w-md mx-auto text-center">Loading...</main>;
  }

  if (error) {
    return <main className="p-4 max-w-md mx-auto text-red-500 text-center">{error}</main>;
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4 text-center">Your Profile</h2>
      <button
        onClick={() => navigate("/news-feed")}
        className="mb-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      >
        Go to News Feed
      </button>
      {/* VIEW MODE */}
      {!editMode && profile && (
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            {profile.profile_pic_url ? (
              <img
                src={profile.profile_pic_url}
                alt="Profile"
                className="rounded-full border mb-4"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-5xl">
                <span role="img" aria-label="avatar">👤</span>
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="mb-2">
              <span className="font-semibold">Name:</span> {profile.name}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Dream Bike:</span> {profile.dream_bike}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Current Bike:</span> {profile.current_bike}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Licence Held:</span> {profile.licence_held}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Location:</span> {profile.location}
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Edit
          </button>
        </div>
      )}
      {/* EDIT MODE */}
      {editMode && (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="rounded-full border mb-2"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            ) : form.profilePicUrl ? (
              <img
                src={form.profilePicUrl}
                alt="Profile"
                className="rounded-full border mb-2"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-5xl">
                <span role="img" aria-label="avatar">👤</span>
              </div>
            )}
            <label className="block font-medium mt-2">Profile Picture (optional):</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="border p-2 rounded bg-white text-black"
            />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />
          <input
            type="text"
            name="dreamBike"
            placeholder="Dream Bike"
            value={form.dreamBike}
            onChange={handleChange}
            className="border p-2 rounded text-black"
            required
          />
          <input
            type="text"
            name="currentBike"
            placeholder="Current Bike"
            value={form.currentBike}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
          <input
            type="text"
            name="licenceHeld"
            placeholder="Licence Held"
            value={form.licenceHeld}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="border p-2 rounded text-black"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
        </form>
      )}
    </main>
  );
};
