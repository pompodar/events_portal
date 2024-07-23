// resources/js/Pages/SavedEvents.jsx
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react';

export default function SavedEvents({ events, filters }) {
    const [currentPage, setCurrentPage] = useState(events.current_page);
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [orderBy, setOrderBy] = useState(filters.orderBy || 'desc');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [deletingEventId, setDeletingEventId] = useState(null);

    function truncateHTML(html, limit) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        let totalWords = 0;
        let truncatedContent = '';
    
        function truncateNode(node) {
            if (totalWords >= limit) return;
    
            if (node.nodeType === Node.TEXT_NODE) {
                let words = node.textContent.split(/\s+/);
                let wordsToAdd = limit - totalWords;
                if (words.length > wordsToAdd) {
                    truncatedContent += words.slice(0, wordsToAdd).join(' ') + ' ';
                    totalWords = limit;
                } else {
                    truncatedContent += node.textContent + ' ';
                    totalWords += words.length;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                truncatedContent += `<${node.nodeName.toLowerCase()}`;
                Array.from(node.attributes).forEach(attr => {
                    truncatedContent += ` ${attr.name}="${attr.value}"`;
                });
                truncatedContent += '>';
    
                node.childNodes.forEach(child => truncateNode(child));
    
                truncatedContent += `</${node.nodeName.toLowerCase()}>`;
            }
        }
    
        Array.from(doc.body.childNodes).forEach(child => truncateNode(child));
    
        return truncatedContent.trim();
    }

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.location.href = `/saved-events?page=${page}&date=${selectedDate}&orderBy=${orderBy}`; // Redirect to the correct page
    };

    const handleFilterChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/saved-events?page=1&date=${newDate}&orderBy=${orderBy}`; // Redirect with updated filter
    };

    const handleOrderChange = (event) => {
        const newOrder = event.target.value;
        setOrderBy(newOrder);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/saved-events?page=1&date=${selectedDate}&orderBy=${newOrder}`; // Redirect with updated order
    };

    const handleDelete = async (id) => {
        setDeletingEventId(id);
        setModalMessage('Are you sure you want to delete this event?');
        setModalVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await fetch(`/events/${deletingEventId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            // Close the modal and refresh the page
            setModalVisible(false);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting event:', error);
            setModalMessage('Failed to delete the event. Please try again.');
        }
    };

    const cancelDelete = () => {
        setModalVisible(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Head title="Russia-Ukraine War Events" />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Russia-Ukraine War Events</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                            <label htmlFor="date-picker" className="block text-gray-700">Filter by Date:</label>
                            <input
                                type="date"
                                id="date-picker"
                                value={selectedDate}
                                onChange={handleFilterChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="order-by" className="block text-gray-700">Order By:</label>
                            <select
                                id="order-by"
                                value={orderBy}
                                onChange={handleOrderChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
                            >
                                <option value="desc">Latest</option>
                                <option value="asc">Oldest</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4 flex flex-wrap gap-2">
                        {events.data.map(event => (
                            <div key={event.id} className="bg-gray-50 p-4 rounded shadow w-[280px] h-full flex flex-col">
                                <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                <p className="text-gray-600">{new Date(event.publicationDate).toLocaleString()}</p>
                                <img src={event.thumbnailUrl} alt="Event Thumbnail" className="max-w-full h-auto mt-auto" />
                                <div dangerouslySetInnerHTML={{ __html: truncateHTML(event.body, 30) }}></div>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={() => handlePageChange(events.prev_page_url ? events.current_page - 1 : events.current_page)}
                            disabled={!events.prev_page_url}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">Page {events.current_page} of {events.last_page}</span>
                        <button
                            onClick={() => handlePageChange(events.next_page_url ? events.current_page + 1 : events.current_page)}
                            disabled={!events.next_page_url}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {modalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                        <p>{modalMessage}</p>
                        <div className="mt-4 flex justify-end space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
