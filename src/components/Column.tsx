import React from 'react';
import Card from './Card';
import './Column.css';

interface ColumnProps {
    title: string;
    cards: { serverName: string; serverStatus: string; serverUrl: string; content: { key: string; value: string }[] }[];
    isOpen: boolean;
    onClick: () => void;
    expandedCard: string | null;  // Track which card is expanded
    setExpandedCard: React.Dispatch<React.SetStateAction<string | null>>;  // Function to set the expanded card
}

const Column: React.FC<ColumnProps> = ({ title, cards, isOpen, onClick, expandedCard, setExpandedCard }) => {
    console.log('Testing: ' + cards[0].content[0].value);
    return (
        <div className={`column ${isOpen ? 'open' : ''}`}>
            <h2 className="column-title" onClick={onClick}>{title}</h2>
            {isOpen && (
                <div className="column-content">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => setExpandedCard(expandedCard === card.serverName ? null : card.serverName)} // Toggle card expand state
                        >
                            <Card
                                serverName={card.serverName}
                                serverUrl={card.serverUrl}
                                content={card.content}
                                isExpanded={expandedCard === card.serverName} // Check if this card is expanded
                                serverStatus={card.serverStatus}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Column;
