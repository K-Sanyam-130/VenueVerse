// ====================================
// MANUAL EVENT STATUS UPDATE SCRIPT
// ====================================
// Run this in your browser console while logged in as admin

const updateEventStatuses = async () => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
        console.error('❌ Not logged in as admin. Please login first.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/admin/update-event-statuses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Event statuses updated successfully!');
            console.log(' PAST events:', data.updated.past);
            console.log('🟢 LIVE events:', data.updated.live);
            console.log('🔵 UPCOMING events:', data.updated.upcoming);
            console.log('📊 Total updated:', data.updated.total);
        } else {
            console.error('❌ Failed to update:', data.msg);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

// Run the update
updateEventStatuses();
