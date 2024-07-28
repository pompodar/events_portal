import { Link, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useState, useEffect } from 'react';

export default function SavedEvents({ auth, events, filters }) {
    const [currentPage, setCurrentPage] = useState(events.current_page);
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [selectedLanguage, setSelectedLanguage] = useState(filters.language);
    const [selectedSource, setSelectedSource] = useState(filters.source);

    const [orderBy, setOrderBy] = useState(filters.orderBy || 'desc');

    useEffect(() => {
        // const fetchData = async () => {
        //     const url = `https://api.nytimes.com/svc/archive/v1/2018/1.json?api-key=EXdL0PlulrdxFC5DW2NsVUCTF7SIjSzx`;
        //     const options = {
        //         method: 'GET',
        //     };

        //     try {
        //         const response = await fetch(url, options);
        //         const result = await response.json();

        //         console.log(result);
        //     } catch (error) {
        //         console.error(error);
        //     }
        // };

         const apiKey = "EXdL0PlulrdxFC5DW2NsVUCTF7SIjSzx";
    //     fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${apiKey}`)
    //   .then(res => res.json()).then(data => {
    //     console.log(data);
    //   });

    //   fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=ukraine&page=1&sort=newest&api-key=${apiKey}`)
    //   .then(res => res.json()).then(data => {
    //     console.log(data);
    //   });

    // fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=ukraine&facet_field=day_of_week&facet=true&begin_date=20220224&end_date=20220224&api-key=${apiKey}`)
    //   .then(res => res.json()).then(data => {
    //     console.log(data);
    //   });

    }, []);

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
        window.location.href = `/?page=${page}&date=${selectedDate}&orderBy=${orderBy}&language=${selectedLanguage}&source=${selectedSource}`;
    };

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedLanguage(newLanguage);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/?page=1&date=${selectedDate}&orderBy=${orderBy}&language=${newLanguage}&source=${selectedSource}`;
    };

    const handleSourceChange = (event) => {
        const newSource = event.target.value;
        setSelectedSource(newSource);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/?page=1&date=${selectedDate}&orderBy=${orderBy}&language=${selectedLanguage}&source=${newSource}`;
    };

    const handleFilterChange = (event) => {
        const newDate = event.target.value;
        setSelectedDate(newDate);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/?page=1&date=${newDate}&orderBy=${orderBy}&language=${selectedLanguage}&source=${selectedSource}`;
    };

    const handleOrderChange = (event) => {
        const newOrder = event.target.value;
        setOrderBy(newOrder);
        setCurrentPage(1); // Reset to the first page
        window.location.href = `/?page=1&date=${selectedDate}&orderBy=${newOrder}&language=${selectedLanguage}&source=${selectedSource}`;
    };

    return (
        <GuestLayout>
            <Head title="Russia-Ukraine War" />
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>
                        <div className="flex flex-col justify-center sm:flex-row items-center mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
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
                            <div className="flex-1">
                                <label htmlFor="language-filter" className="block text-gray-700">Filter by Language:</label>
                                <select
                                    id="language-filter"
                                    value={selectedLanguage}
                                    onChange={handleLanguageChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
                                >
                                    <option value="English">English</option>
                                    <option value="Ukrainian">Ukrainian</option>
                                    <option value="Russian">Russian</option>
                                    <option value="null">All</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="source-filter" className="block text-gray-700">Filter by Source:</label>
                                <select
                                    id="source-filter"
                                    value={selectedSource}
                                    onChange={handleSourceChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
                                >
                                    <option value="The Guardian">The Guardian</option>
                                    <option value="The New York Times">The New York Times</option>
                                    <option value="null">All</option>
                                    {/* Add more sources as needed */}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4 flex flex-wrap justify-center items-center gap-2">
                            {events.data.map(event => (
                                <a href={"/event/" + event.id} key={event.id} className="bg-gray-50 p-4 rounded shadow w-[280px] h-full flex flex-col">
                                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                                    <p className="text-gray-600">{new Date(event.publicationDate).toLocaleString()}</p>
                                    <img src={event.thumbnailUrl} alt="Event Thumbnail" className="max-w-full h-auto mt-auto" />
                                    <div dangerouslySetInnerHTML={{ __html: truncateHTML(event.body, 30) }}></div>
                                    <p className="text-gray-600">{event.source}</p>
                                </a>
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
            </div>
        </GuestLayout>
    );
}
