import React from "react";

export const CreateProfilePage: React.FC = () => {
  return (
    <main className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Create Your Profile</h2>
      <form className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your Name"
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Favorite Bike"
          className="border p-2 rounded"
        />
        {/* Add more fields as needed */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Save Profile
        </button>
      </form>
    </main>
  );
};
