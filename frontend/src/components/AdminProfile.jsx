import React, { useState, useEffect } from "react";
import { User, Mail, Building2, MapPin, Plus, X, ArrowLeft, Edit2, Save } from "lucide-react";
import "./AdminProfile.css";
import { API_BASE_URL } from "../api";

export default function AdminProfile({ onBack }) {
    const [profile, setProfile] = useState(null);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedDepartment, setEditedDepartment] = useState("");
    const [newVenue, setNewVenue] = useState("");
    const [showAddVenue, setShowAddVenue] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetchProfile();
        fetchVenues();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_BASE_URL}/admin/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.admin);
                setEditedName(data.admin.name || "");
                setEditedDepartment(data.admin.department || "");
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
            setError("Failed to load profile");
        }
    };

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_BASE_URL}/admin/venues`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setVenues(data.venues || []);
            }
        } catch (err) {
            console.error("Venues fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_BASE_URL}/admin/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editedName,
                    department: editedDepartment,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data.admin);
                setEditMode(false);
                setSuccess("Profile updated successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Failed to update profile");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            setError("Failed to update profile");
        }
    };

    const handleAddVenue = async () => {
        if (!newVenue.trim()) {
            setError("Venue name cannot be empty");
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_BASE_URL}/admin/venues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ venue: newVenue.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setVenues(data.venues);
                setNewVenue("");
                setShowAddVenue(false);
                setSuccess("Venue added successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.msg || "Failed to add venue");
            }
        } catch (err) {
            console.error("Add venue error:", err);
            setError("Failed to add venue");
        }
    };

    const handleRemoveVenue = async (venue) => {
        if (!window.confirm(`Remove "${venue}" from your managed venues?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_BASE_URL}/admin/venues/${encodeURIComponent(venue)}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.ok) {
                setVenues(data.venues);
                setSuccess("Venue removed successfully!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.msg || "Failed to remove venue");
            }
        } catch (err) {
            console.error("Remove venue error:", err);
            setError("Failed to remove venue");
        }
    };

    return (
        <div className="admin-profile-root">
            <div className="admin-profile-bg-gradient" />
            <div className="admin-profile-bg-radial" />

            <header className="admin-profile-header">
                <div className="admin-profile-header-inner">
                    <button className="admin-profile-back-btn" onClick={onBack}>
                        <ArrowLeft />
                    </button>
                    <div className="admin-profile-title-wrapper">
                        <User className="admin-profile-title-icon" />
                        <h1 className="admin-profile-title">Admin Profile</h1>
                    </div>
                </div>
            </header>

            <main className="admin-profile-main">
                {error && (
                    <div className="admin-profile-alert admin-profile-alert-error">
                        {error}
                        <button onClick={() => setError("")} className="admin-profile-alert-close">×</button>
                    </div>
                )}

                {success && (
                    <div className="admin-profile-alert admin-profile-alert-success">
                        {success}
                        <button onClick={() => setSuccess("")} className="admin-profile-alert-close">×</button>
                    </div>
                )}

                {profile && (
                    <section className="admin-profile-card">
                        <div className="admin-profile-card-header">
                            <h2>Profile Information</h2>
                            {!editMode ? (
                                <button className="admin-profile-edit-btn" onClick={() => setEditMode(true)}>
                                    <Edit2 size={18} />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <div className="admin-profile-edit-actions">
                                    <button className="admin-profile-save-btn" onClick={handleUpdateProfile}>
                                        <Save size={18} />
                                        <span>Save</span>
                                    </button>
                                    <button
                                        className="admin-profile-cancel-btn"
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditedName(profile.name || "");
                                            setEditedDepartment(profile.department || "");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="admin-profile-card-body">
                            <div className="admin-profile-field">
                                <User size={20} className="admin-profile-field-icon" />
                                <div className="admin-profile-field-content">
                                    <label>Name</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="admin-profile-input"
                                        />
                                    ) : (
                                        <span>{profile.name}</span>
                                    )}
                                </div>
                            </div>

                            <div className="admin-profile-field">
                                <Mail size={20} className="admin-profile-field-icon" />
                                <div className="admin-profile-field-content">
                                    <label>Email</label>
                                    <span>{profile.email}</span>
                                </div>
                            </div>

                            <div className="admin-profile-field">
                                <Building2 size={20} className="admin-profile-field-icon" />
                                <div className="admin-profile-field-content">
                                    <label>Department</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={editedDepartment}
                                            onChange={(e) => setEditedDepartment(e.target.value)}
                                            className="admin-profile-input"
                                            placeholder="e.g., Computer Science"
                                        />
                                    ) : (
                                        <span>{profile.department || "Not specified"}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <section className="admin-profile-card">
                    <div className="admin-profile-card-header">
                        <h2>Managed Venues ({venues.length})</h2>
                        <button
                            className="admin-profile-add-venue-btn"
                            onClick={() => setShowAddVenue(!showAddVenue)}
                        >
                            <Plus size={18} />
                            <span>Add Venue</span>
                        </button>
                    </div>

                    {showAddVenue && (
                        <div className="admin-profile-add-venue-form">
                            <input
                                type="text"
                                placeholder="Enter venue name..."
                                value={newVenue}
                                onChange={(e) => setNewVenue(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddVenue()}
                                className="admin-profile-input"
                            />
                            <button onClick={handleAddVenue} className="admin-profile-save-btn">
                                Add
                            </button>
                            <button onClick={() => setShowAddVenue(false)} className="admin-profile-cancel-btn">
                                Cancel
                            </button>
                        </div>
                    )}

                    <div className="admin-profile-card-body">
                        {loading ? (
                            <div className="admin-profile-loading">Loading venues...</div>
                        ) : venues.length === 0 ? (
                            <div className="admin-profile-empty">
                                <MapPin size={48} className="admin-profile-empty-icon" />
                                <h3>No Venues Assigned</h3>
                                <p>You don't have any managed venues yet. Add venues to start managing event requests.</p>
                                <p className="admin-profile-note">
                                    <strong>Note:</strong> Admins with no venues can see ALL event requests (Super Admin mode).
                                </p>
                            </div>
                        ) : (
                            <div className="admin-profile-venues-grid">
                                {venues.map((venue, index) => (
                                    <div key={index} className="admin-profile-venue-card">
                                        <MapPin size={20} className="admin-profile-venue-icon" />
                                        <span className="admin-profile-venue-name">{venue}</span>
                                        <button
                                            onClick={() => handleRemoveVenue(venue)}
                                            className="admin-profile-venue-remove"
                                            title="Remove venue"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
