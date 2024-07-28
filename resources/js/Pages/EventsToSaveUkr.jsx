import OnSaveEventsModal from '@/Components/OnSaveEventsModal';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        // Retrieve the stored date from localStorage or default to a specific date
        return localStorage.getItem('selectedDate-UkrEvents') || '2022-02-24';
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchData = async (date) => {
            const url = `https://gnews.io/api/v4/top-headlines?category=general&apikey=6fba38d1e0fc42565fe317d1cb337b5a&lang=ua&country=ua&from=${selectedDate}T00:00:09Z&to=${selectedDate}T23:59:09Z`;
            const options = {
                method: 'GET',
            };

            try {
                const response = await fetch(url, options);
                const result = await response.json();

                setEvents(result.articles);

                console.log(result, "ukr news");
            } catch (error) {
                console.error(error);
            }
        };

        

        fetchData(selectedDate);
    }, [selectedDate]);

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

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        const formattedDate = newDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        localStorage.setItem('selectedDate-UkrEvents', formattedDate); // Store the date in localStorage
        localStorage.setItem('currentPage', 1); // Store the reset page number in localStorage
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    };

    const handlePreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        const formattedDate = newDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        localStorage.setItem('selectedDate-UkrEvents', formattedDate); // Store the date in localStorage
        localStorage.setItem('currentPage', 1); // Store the reset page number in localStorage
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    };

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate);
        localStorage.setItem('selectedDate-UkrEvents', newDate); // Store the date in localStorage
        setPage(1); // Reset to the first page whenever the date changes
    };

    const saveEvent = async (event) => {
        try {
            const response = await fetch('/events/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    title: event.title,
                    url: event.url,
                    body: event.content,
                    thumbnailUrl: event.image,
                    publicationDate: event.publishedAt,
                    language: 'Russian',
                    source: event.source.name
                }),                
            });

            const data = await response.json();
            setModalMessage(data.message);
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

        } catch (error) {
            setModalMessage(data.message);
            setIsModalOpen("Error saving event..");

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);
            console.error('Error saving event:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <Head title="Welcome" />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <div className="mt-6">
                        <Link href={route('events.saved')} className="text-indigo-600 hover:text-indigo-900">View Saved Events</Link>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Events</h2>
                    <div>
                        <div className="mb-4">
                            <label htmlFor="date-picker" className="block text-gray-700">Select Date:</label>
                            <input
                                type="date"
                                id="date-picker"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
                            />
                            <button
                                onClick={handlePreviousDay}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Previous Day
                            </button>
                            <button
                                onClick={handleNextDay}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Next Day
                            </button>
                        </div>
                        <div className="space-y-4 flex flex-wrap justify-center items-center gap-2">
                            {events.map(event => (
                                <div key={event.title} className="bg-gray-50 p-4 rounded shadow w-[280px] flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                    <p className="text-gray-600 mb-2">{new Date(event.publishedAt).toLocaleString()}</p>
                                    {event.image && 
                                        <div className="mt-auto">
                                            <img src={event.image} alt={event.title} className="max-w-full h-auto" />
                                        </div>
                                    }
                                    <div dangerouslySetInnerHTML={{ __html: truncateHTML(event.content, 30) }}></div>
                                    <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 mt-auto hover:text-indigo-900">Read more</a>
                                    <p className="text-gray-600 mb-2">{event.source.name}</p>
                                    <button
                                        onClick={() => saveEvent(event)}
                                        className="bg-blue-500 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Save Event
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                            <button
                                onClick={handlePreviousDay}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Previous Day
                            </button>
                            <button
                                onClick={handleNextDay}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Next Day
                            </button>
                        </div>
                </div>
            </div>
            <OnSaveEventsModal isOpen={isModalOpen} message={modalMessage} />
        </div>
    );
}
