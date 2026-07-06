import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Sync local state with user from context
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setImage(user.image || null);
      setImagePreview(user.image || null);
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        setImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({ name, email, phone, address, image });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await deleteProfile();
        navigate('/');
      } catch (err) {
        console.error('Failed to delete profile:', err);
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>My Profile</h1>
            <div className="profile-actions">
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
              <button onClick={handleDeleteProfile} className="delete-profile-button">
                Delete Profile
              </button>
            </div>
          </div>

          <div className="profile-content">
            {!isEditing ? (
              <>
                <div className="profile-image-section">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span className="placeholder-icon">👤</span>
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <div className="info-row">
                    <label>Name</label>
                    <p>{user?.name}</p>
                  </div>
                  <div className="info-row">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="info-row">
                    <label>Phone</label>
                    <p>{user?.phone || 'Not added'}</p>
                  </div>
                  <div className="info-row">
                    <label>Address</label>
                    <p>{user?.address || 'Not added'}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditing(true)} className="primary-button">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="profile-image-section">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="profile-image" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span className="placeholder-icon">👤</span>
                    </div>
                  )}
                  <label className="image-upload-label">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <form className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Add your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      placeholder="Add your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </form>

                <div className="form-actions">
                  <button onClick={handleSave} className="primary-button">
                    Save Changes
                  </button>
                  <button onClick={() => setIsEditing(false)} className="secondary-button">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
