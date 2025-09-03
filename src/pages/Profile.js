import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Leaf, Award, BarChart3, Gift, Shield } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [userStats, setUserStats] = useState({
    airQualityChecks: 0,
    sensorDataViews: 0,
    plantsOrdered: 0,
    carbonFootprintReduced: 0,
    totalPoints: 0
  });
  const [availableRewards, setAvailableRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      const userInfoData = {
        firstName: user.name?.split(' ')[0] || user.email.split('@')[0],
        lastName: user.name?.split(' ')[1] || '',
        email: user.email,
        phone: '+1 (555) 123-4567',
        location: 'Your Location',
        joinDate: '2024-09-01',
        bio: 'Environmental enthusiast passionate about air quality monitoring and sustainable living.',
        avatar: null
      };
      setUserInfo(userInfoData);
      setEditForm({...userInfoData});
      
      // Load or initialize user stats
      const storedStats = localStorage.getItem('userStats');
      if (storedStats) {
        setUserStats(JSON.parse(storedStats));
      } else {
        // Initialize with some sample data
        const initialStats = {
          airQualityChecks: Math.floor(Math.random() * 50) + 10,
          sensorDataViews: Math.floor(Math.random() * 100) + 25,
          plantsOrdered: Math.floor(Math.random() * 10) + 2,
          carbonFootprintReduced: Math.floor(Math.random() * 500) + 100,
          totalPoints: 0
        };
        
        // Calculate total points based on activities
        initialStats.totalPoints = 
          (initialStats.airQualityChecks * 10) +
          (initialStats.sensorDataViews * 5) +
          (initialStats.plantsOrdered * 50) +
          Math.floor(initialStats.carbonFootprintReduced / 10);
        
        setUserStats(initialStats);
        localStorage.setItem('userStats', JSON.stringify(initialStats));
      }
      
      // Load rewards
      loadRewards();
    }
  }, []);

  const loadRewards = () => {
    const allRewards = [
      { id: 1, name: 'Eco-Warrior Badge', description: 'Complete 10 air quality checks', points: 100, type: 'badge', icon: '🏆' },
      { id: 2, name: 'Plant Care Kit', description: 'Order 5 plants from our store', points: 250, type: 'merchandise', icon: '🌱' },
      { id: 3, name: 'Air Purifier Discount', description: '20% off air purifiers', points: 300, type: 'discount', icon: '💨' },
      { id: 4, name: 'Seed Starter Pack', description: 'Free organic seeds for your garden', points: 150, type: 'merchandise', icon: '🌿' },
      { id: 5, name: 'Environmental Champion', description: 'Reduce carbon footprint by 500kg', points: 500, type: 'badge', icon: '🌍' }
    ];
    
    const claimed = JSON.parse(localStorage.getItem('claimedRewards') || '[]');
    const available = allRewards.filter(reward => 
      userStats.totalPoints >= reward.points && !claimed.some(claimed => claimed.id === reward.id)
    );
    
    setAvailableRewards(available);
    setClaimedRewards(claimed);
  };

  useEffect(() => {
    if (userStats.totalPoints > 0) {
      loadRewards();
    }
  }, [userStats.totalPoints]);

  const claimReward = (reward) => {
    const newClaimed = [...claimedRewards, { ...reward, claimedAt: new Date() }];
    setClaimedRewards(newClaimed);
    localStorage.setItem('claimedRewards', JSON.stringify(newClaimed));
    
    // Remove from available rewards
    setAvailableRewards(prev => prev.filter(r => r.id !== reward.id));
    
    // Deduct points
    const newStats = { ...userStats, totalPoints: userStats.totalPoints - reward.points };
    setUserStats(newStats);
    localStorage.setItem('userStats', JSON.stringify(newStats));
    
    alert(`🎉 Congratulations! You've claimed: ${reward.name}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({...userInfo});
  };

  const handleSave = () => {
    setUserInfo({...editForm});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({...userInfo});
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Air Quality Checks', value: '42', icon: BarChart3, color: '#22c55e' },
    { label: 'Plants Purchased', value: '8', icon: Leaf, color: '#16a34a' },
    { label: 'Points Earned', value: '1,250', icon: Award, color: '#eab308' },
    { label: 'Days Active', value: '89', icon: Calendar, color: '#3b82f6' }
  ];

  if (!userInfo) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Please log in to view your profile</h2>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-banner">
            <div className="banner-gradient"></div>
          </div>
          
          <div className="profile-info">
            <div className="avatar-section">
              <div className="avatar-container">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
                {isEditing && (
                  <label className="avatar-upload">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange}
                      hidden 
                    />
                  </label>
                )}
              </div>
              
              <div className="user-details">
                {isEditing ? (
                  <div className="edit-name">
                    <input
                      type="text"
                      name="firstName"
                      value={editForm.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="edit-input"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={editForm.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="edit-input"
                    />
                  </div>
                ) : (
                  <h1 className="user-name">{userInfo.firstName} {userInfo.lastName}</h1>
                )}
                
                <div className="user-meta">
                  <span className="user-email">
                    <Mail size={16} />
                    {userInfo.email}
                  </span>
                  <span className="join-date">
                    <Calendar size={16} />
                    Joined {new Date(userInfo.joinDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={handleEdit} className="edit-btn">
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section">
          <h2>Your Environmental Impact</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-body">
          {/* Personal Information */}
          <div className="info-section">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{userInfo.phone}</div>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">
                  <MapPin size={18} />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <div className="info-value">{userInfo.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bio-section">
            <h2>About Me</h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                className="bio-textarea"
                rows={4}
                placeholder="Tell us about yourself and your environmental interests..."
              />
            ) : (
              <p className="bio-text">{userInfo.bio}</p>
            )}
          </div>

          {/* Eco Points & Rewards Section */}
          <div className="rewards-section">
            <div className="points-header">
              <h2>🏆 Eco Points & Rewards</h2>
              <div className="points-display">
                <Award size={24} />
                <span className="points-value">{userStats.totalPoints}</span>
                <span className="points-label">Eco Points</span>
              </div>
            </div>

            {/* Available Rewards */}
            {availableRewards.length > 0 && (
              <div className="available-rewards">
                <h3>🎁 Available Rewards</h3>
                <div className="rewards-grid">
                  {availableRewards.map(reward => (
                    <div key={reward.id} className="reward-card available">
                      <div className="reward-header">
                        <span className="reward-icon">{reward.icon}</span>
                        <div className="reward-type">{reward.type}</div>
                      </div>
                      <h4 className="reward-name">{reward.name}</h4>
                      <p className="reward-description">{reward.description}</p>
                      <div className="reward-footer">
                        <div className="reward-cost">{reward.points} points</div>
                        <button 
                          className="claim-btn"
                          onClick={() => claimReward(reward)}
                        >
                          <Gift size={16} />
                          Claim
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claimed Rewards */}
            {claimedRewards.length > 0 && (
              <div className="claimed-rewards">
                <h3>🏆 Your Achievements</h3>
                <div className="rewards-grid">
                  {claimedRewards.map(reward => (
                    <div key={reward.id} className="reward-card claimed">
                      <div className="reward-header">
                        <span className="reward-icon">{reward.icon}</span>
                        <div className="reward-type">{reward.type}</div>
                      </div>
                      <h4 className="reward-name">{reward.name}</h4>
                      <p className="reward-description">{reward.description}</p>
                      <div className="reward-footer">
                        <div className="reward-claimed">
                          ✅ Claimed on {new Date(reward.claimedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points Earning Guide */}
            <div className="points-guide">
              <h3>📈 How to Earn Points</h3>
              <div className="earning-methods">
                <div className="earning-item">
                  <BarChart3 size={20} />
                  <span>Air Quality Check: +10 points</span>
                </div>
                <div className="earning-item">
                  <BarChart3 size={20} />
                  <span>View Sensor Data: +5 points</span>
                </div>
                <div className="earning-item">
                  <Leaf size={20} />
                  <span>Order Plants: +50 points</span>
                </div>
                <div className="earning-item">
                  <Shield size={20} />
                  <span>Carbon Reduction: +1 point per 10kg CO₂</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon upload">
                  <BarChart3 size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Uploaded air quality image</div>
                  <div className="activity-time">2 hours ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon purchase">
                  <Leaf size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Purchased Peace Lily plant</div>
                  <div className="activity-time">1 day ago</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon sensor">
                  <BarChart3 size={20} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">Checked sensor data dashboard</div>
                  <div className="activity-time">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
