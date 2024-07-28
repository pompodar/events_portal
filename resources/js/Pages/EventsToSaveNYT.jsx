import OnSaveEventsModal from '@/Components/OnSaveEventsModal';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [page, setPage] = useState(() => {
        // Retrieve the stored page from localStorage or default to 1
        return parseInt(localStorage.getItem('currentPage-nyt'), 10) || 1;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        // Retrieve the stored date from localStorage or default to a specific date
        return localStorage.getItem('selectedDate-nyt') || '2022-02-24';
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchEvents = async (pageNumber, date) => {
            const apiKey = "EXdL0PlulrdxFC5DW2NsVUCTF7SIjSzx";
            fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=ukraine&facet_field=day_of_week&facet=true&begin_date=${date.replaceAll("-", "")}&end_date=${date.replaceAll("-", "")}&api-key=${apiKey}&page=${pageNumber}`)
            .then(res => res.json()).then(data => {
                console.log(data.response);

                setTotalPages(Math.floor(data.response.meta.hits/10))

                setEvents(data.response.docs);
            });
        };

        fetchEvents(page, selectedDate);
    }, [page, selectedDate]);

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

    const handleNextPage = () => {
        if (page < totalPages) {
            const newPage = page + 1;
            setPage(newPage);
            localStorage.setItem('currentPage-nyt', newPage); // Store the current page in localStorage

            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            const newPage = page - 1;
            setPage(newPage);
            localStorage.setItem('currentPage-nyt', newPage); // Store the current page in localStorage

            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        const formattedDate = newDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        localStorage.setItem('selectedDate-nyt', formattedDate); // Store the date in localStorage
        setPage(1); // Reset to the first page whenever the date changes
        localStorage.setItem('currentPage-nyt', 1); // Store the reset page number in localStorage
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    };

    const handlePreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        const formattedDate = newDate.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
        localStorage.setItem('selectedDate-nyt', formattedDate); // Store the date in localStorage
        setPage(1); // Reset to the first page whenever the date changes
        localStorage.setItem('currentPage-nyt', 1); // Store the reset page number in localStorage
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    };

    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate);
        localStorage.setItem('selectedDate-nyt', newDate); // Store the date in localStorage
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
                    title: event.headline.main,
                    url: event.web_url,
                    body: event.abstract,
                    thumbnailUrl: event.multimedia
                        .filter((element) => element.subtype === "xlarge")
                        .map((element) => "https://www.nytimes.com/" + element.url)
                        .flat()
                        .pop(),
                    publicationDate: event.pub_date,
                    language: 'English',
                    source: 'The New York Times'
                }),                
            });

            const data = await response.json();
            setModalMessage(data.message);
            setIsModalOpen(true);

            setTimeout(() => {
                setIsModalOpen(false);
            }, 2000);

        } catch (error) {
            setModalMessage(error);
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
                    <div className="mt-6 flex justify-between items-center">
                        <button 
                            onClick={handlePreviousPage} 
                            disabled={page === 1}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">Page {page} of {totalPages}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={page === totalPages}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
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
                                <div key={event._id} className="bg-gray-50 p-4 rounded shadow w-[280px] flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-900">{event.headline.main}</h3>
                                    <p className="text-gray-600 mb-2">{new Date(event.pub_date).toLocaleString()}</p>
                                    {event.multimedia && event.multimedia.filter((element) => element.subtype === "xlarge").map((element, index) => (
                                        <div className="mt-auto" key={index}>
                                                <img key={index} src={`https://www.nytimes.com/${element.url}`} alt={event.abstract} className="max-w-full h-auto" />
                                        </div>
                                    ))
                                    }
                                    <div dangerouslySetInnerHTML={{ __html: truncateHTML(event.abstract, 30) }}></div>
                                    <a href={event.web_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 mt-auto hover:text-indigo-900">Read more</a>
                                    <p className="text-gray-600 mb-2">{event.source}</p>
                                    <button
                                        onClick={() => saveEvent(event)}
                                        className="bg-blue-500 w-full text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Save Event
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <button 
                                onClick={handlePreviousPage} 
                                disabled={page === 1}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">Page {page} of {totalPages}</span>
                            <button 
                                onClick={handleNextPage} 
                                disabled={page === totalPages}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <OnSaveEventsModal isOpen={isModalOpen} message={modalMessage} />
        </div>
    );
}