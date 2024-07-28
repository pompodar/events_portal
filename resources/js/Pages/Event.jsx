import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Event({ event }) {
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

    return (
        <GuestLayout>
            <Head title={event.title} />
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                        <p className="text-gray-600">{new Date(event.publicationDate).toLocaleString()}</p>
                        <img src={event.thumbnailUrl} alt="Event Thumbnail" className="max-w-full h-auto mt-4" />
                        <div dangerouslySetInnerHTML={{ __html: event.body }} className="mt-4"></div>
                        <p className="text-gray-600 mt-4">{event.source}</p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
