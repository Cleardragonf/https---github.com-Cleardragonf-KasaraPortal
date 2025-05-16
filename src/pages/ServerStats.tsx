import React, { useEffect, useState } from 'react';
import ServerInfo from '../data/ServerInfo';
import './ServerStats.css'; // Add styles for the cards

interface ServerData {
    status: string;
    services?: { name: string; status: string }[];
}

const ServerStats = () => {
    const [stats, setStats] = useState<{ [key: string]: ServerData }>({});

    useEffect(() => {
        const sockets: WebSocket[] = [];

        Object.values(ServerInfo).flat().forEach((server) => {
            const socket = new WebSocket(server.url);
            sockets.push(socket);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.name) {
                        setStats((prevStats) => ({
                            ...prevStats,
                            [data.name]: {
                                status: data.status,
                                services: data.data?.services || [],
                            },
                        }));
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            socket.onerror = () => {
                setStats((prevStats) => ({
                    ...prevStats,
                    [server.name]: { status: 'Error connecting to server' },
                }));
            };
        });

        return () => {
            sockets.forEach((socket) => socket.close());
        };
    }, []);

    return (
        <div>
            <h1>Server Stats</h1>
            {Object.entries(ServerInfo).map(([env, servers]) => (
                <div key={env} className="environment-section">
                    <h2>{env.toUpperCase()}</h2>
                    <div className="server-cards">
                        {servers.map((server) => {
                            const serverData = stats[server.name];
                            return (
                                <div key={server.name} className="server-card">
                                    <h3>{server.name}</h3>
                                    <p>Status: {serverData ? serverData.status : 'Loading...'}</p>
                                    {serverData?.services && (
                                        <ul>
                                            {serverData.services.map((service, index) => (
                                                <li key={index}>
                                                    {service.name}: {service.status}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ServerStats;