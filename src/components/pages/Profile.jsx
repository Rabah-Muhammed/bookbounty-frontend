import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Toast from "../../utils/Toast";
import { MEDIA_BASE_URL } from "../../utils/api";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    avatar: null,
    favorite_genre: "",
    created_at: new Date().toISOString()
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(avatarFile);
    }
  }, [avatarFile]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/profile/");
      setProfile(res.data);
      setAvatarError(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
      Toast("error", "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        Toast("error", "Only JPG, PNG or GIF images are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        Toast("error", "Image must be less than 2MB");
        return;
      }
      setAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("phone", profile.phone);
    formData.append("bio", profile.bio);
    formData.append("favorite_genre", profile.favorite_genre);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const res = await api.put("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
      setAvatarFile(null);
      setAvatarPreview("");
      setAvatarError(false);
      setIsEditing(false);
      Toast("success", "Profile updated successfully");
    } catch (err) {
      Toast("error", "Update failed");
      console.error("Profile update error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFallbackAvatar = (size = '4xl') => (
    <div className={`w-full h-full bg-gray-100 flex items-center justify-center rounded-full`}>
      <span className={`text-${size} font-medium text-gray-400`}>
        {profile.username?.charAt(0).toUpperCase() || '?'}
      </span>
    </div>
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
            <p className="mt-2 text-gray-600">
              {isEditing ? "Edit your personal information" : "View and manage your profile"}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 sm:mt-0 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
              <div className="px-6 py-8 space-y-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 shadow-inner">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : profile.avatar && !avatarError ? (
                        <img
                          src={`${MEDIA_BASE_URL}${profile.avatar}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        renderFallbackAvatar()
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Click on the icon to change your photo
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Favorite Genre
                    </label>
                    <input
                      type="text"
                      name="favorite_genre"
                      value={profile.favorite_genre || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="e.g., Science Fiction, Mystery"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                      placeholder="Tell us about yourself and your reading preferences..."
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    setAvatarPreview("");
                    setAvatarError(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 ${
                    isLoading ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-inner">
                      {profile.avatar && !avatarError ? (
                        <img
                          src={`${MEDIA_BASE_URL}${profile.avatar}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        renderFallbackAvatar('3xl')
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.username}
                    </h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <p className="mt-2 text-gray-500 text-sm">
                      Member since {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Personal Information
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="mt-1 text-gray-900">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Favorite Genre
                        </p>
                        <p className="mt-1 text-gray-900">
                          {profile.favorite_genre || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    About
                  </h3>
                  <div className="mt-4">
                    <p className="text-gray-900 whitespace-pre-line">
                      {profile.bio || "No bio provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;