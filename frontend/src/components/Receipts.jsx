import React, { useState, useEffect } from "react";
import { FileText, Download, Calendar, User, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import "./Receipts.css";
import { ENDPOINTS, API_BASE_URL } from "../api";

export default function Receipts({ onBack }) {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("clubToken");

            const res = await fetch(`${API_BASE_URL}/receipts/club`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setReceipts(data.receipts || []);
            } else {
                setError("Failed to fetch receipts");
            }
        } catch (err) {
            console.error("Fetch receipts error:", err);
            setError("Failed to load receipts");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (receiptId, eventName) => {
        try {
            const token = localStorage.getItem("clubToken");

            const res = await fetch(`${API_BASE_URL}/receipts/download/${receiptId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Receipt_${eventName.replace(/\s+/g, "_")}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("Failed to download receipt");
            }
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download receipt");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="receipts-root">
            {/* Animated background */}
            <div className="receipts-bg-gradient" />
            <div className="receipts-bg-radial" />

            {/* Floating particles */}
            <div className="receipts-particles" aria-hidden>
                {Array.from({ length: 15 }).map((_, i) => (
                    <span
                        key={i}
                        className="receipts-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <header className="receipts-header">
                <div className="receipts-header-inner">
                    <button className="receipts-back-btn" onClick={onBack} aria-label="Go back">
                        <ArrowLeft />
                    </button>
                    <div className="receipts-title-wrapper">
                        <FileText className="receipts-title-icon" />
                        <h1 className="receipts-title">Event Receipts</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="receipts-main">
                {loading ? (
                    <div className="receipts-loading">
                        <div className="receipts-spinner" />
                        <p>Loading receipts...</p>
                    </div>
                ) : error ? (
                    <div className="receipts-error">
                        <p>{error}</p>
                    </div>
                ) : receipts.length === 0 ? (
                    <div className="receipts-empty">
                        <FileText size={64} className="receipts-empty-icon" />
                        <h2>No Receipts Found</h2>
                        <p>Receipts will appear here when your events are approved by the admin.</p>
                    </div>
                ) : (
                    <div className="receipts-grid">
                        {receipts.map((receipt, index) => (
                            <article
                                key={receipt._id}
                                className="receipt-card"
                                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                            >
                                <div className="receipt-card-header">
                                    <div className="receipt-icon-wrapper">
                                        <FileText className="receipt-icon" />
                                    </div>
                                    <div className="receipt-header-content">
                                        <h3 className="receipt-event-name">{receipt.eventName}</h3>
                                        <p className="receipt-club-name">{receipt.clubName}</p>
                                    </div>
                                </div>

                                <div className="receipt-card-body">
                                    <div className="receipt-detail-row">
                                        <Calendar size={16} className="receipt-detail-icon" />
                                        <div>
                                            <span className="receipt-detail-label">Event Date:</span>
                                            <span className="receipt-detail-value">{receipt.date}</span>
                                        </div>
                                    </div>

                                    <div className="receipt-detail-row">
                                        <User size={16} className="receipt-detail-icon" />
                                        <div>
                                            <span className="receipt-detail-label">Approved By:</span>
                                            <span className="receipt-detail-value">{receipt.approvedBy}</span>
                                        </div>
                                    </div>

                                    <div className="receipt-detail-row">
                                        <CheckCircle size={16} className="receipt-detail-icon" />
                                        <div>
                                            <span className="receipt-detail-label">Approval Date:</span>
                                            <span className="receipt-detail-value">
                                                {formatDate(receipt.approvalDate)} at {formatTime(receipt.approvalDate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="receipt-detail-row">
                                        <Mail size={16} className="receipt-detail-icon" />
                                        <div>
                                            <span className="receipt-detail-label">Sent To:</span>
                                            <span className="receipt-detail-value">{receipt.memberEmail}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="receipt-card-footer">
                                    <button
                                        className="receipt-download-btn"
                                        onClick={() => handleDownload(receipt._id, receipt.eventName)}
                                    >
                                        <Download size={18} />
                                        <span>Download PDF</span>
                                    </button>
                                </div>

                                <div className="receipt-corner tl" />
                                <div className="receipt-corner br" />
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
