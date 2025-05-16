import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './Card.css';
console.log('REACT_APP_PROXY:', process.env.REACT_APP_PROXY); // Debug log
const proxyUrl = process.env.REACT_APP_PROXY;
if (!proxyUrl) {
    throw new Error('REACT_APP_PROXY is not defined');
}


interface CardProps {
    serverName: string;
    serverUrl: string;
    content: { key: string; value: string }[];
    isExpanded: boolean;
    serverStatus: string;
}

interface DiskUsage {
    drive: string;
    totalSpace: number;
    freeSpace: number;
    usedSpace: number;
}

interface SystemStats {
    cpu: number;
    memory: number;
    diskUsage: DiskUsage[];
}

interface Service {
    name: string;
    status: string; // e.g., "Running", "Stopped", or "Disabled"
    uptime: string;
}

interface ServerData {
    serverId: string;
    status: string;
    lastChecked: string;
    responseTime: number;
    services: Service[];
    systemStats: SystemStats;
}

const Card: React.FC<CardProps> = ({ serverName, serverUrl, content, isExpanded, serverStatus }) => {
    const [isOpen, setIsOpen] = useState(isExpanded); // Default to collapsed
    const [status, setStatus] = useState<string>(serverStatus); // Default to 'Checking' initially
    const [serverData, setServerData] = useState<ServerData | null>(null); // Local state for full server data//content!
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Loading state for the first fetch

    useEffect(() => {
        if (content && content.length > 0) {
            const transformedData: ServerData = {
                serverId: '', // Set the serverId as needed
                status: '', // Set the status based on content or other criteria
                lastChecked: '', // Set lastChecked value if available
                responseTime: 0, // Initialize response time as needed
                services: [], // Services will need to be populated separately
                systemStats: {
                    cpu: 0,
                    memory: 0,
                    diskUsage: [],
                },
            };

            // Use content to fill the server data object
            content.forEach((item) => {
                switch (item.key) {
                    case 'status':
                        transformedData.status = item.value;
                        break;
                    case 'lastChecked':
                        transformedData.lastChecked = item.value;
                        break;
                    case 'responseTime':
                        transformedData.responseTime = parseFloat(item.value);
                        break;
                    // You can add more cases as needed based on the content structure
                    default:
                        break;
                }
            });

            // Set the transformed data to serverData state
            setServerData(transformedData);
            console.log(serverData)
        }
    }, [content]);

    // Fetch data once when the page loads or the column opens
    useEffect(() => {
        const fetchServerData = async () => {
            setLoading(false); // Start loading for the first fetch
            try {
                
            } catch (error) {
                console.error('Error fetching server data:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };

        // Fetch data on page load or when the column opens
        fetchServerData(); // Initial fetch
    }, [serverName]);

    // Poll server data only if the card is open
    useEffect(() => {
        if (!isOpen) return; // Don't poll if the card is not open

        const intervalId = setInterval(async () => {
            setLoading(false); // Set loading to true before fetching new data
            try {
                const response = await fetch(`${proxyUrl}/api/server_Check/${serverName}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                if (data && data.serverId) {
                    setServerData(prevData => prevData ? { ...prevData, ...data } : data); // Update server data without affecting open state
                    setStatus(data.status); // Update status based on new data
                } else {
                    throw new Error("Invalid server data format received.");
                }
            } catch (error) {
                console.error('Error fetching server data:', error);
                setStatus('Offline'); // Set status to Offline in case of errors
            } finally {
                setLoading(false); // Set loading to false after updating data
            }
        }, 5000); // Refresh every 5 seconds

        // Cleanup the interval on unmount or if the card closes
        return () => clearInterval(intervalId);
    }, [isOpen, serverName]); // Only run the heartbeat for open cards

    const interpolateColor = (percentage: number) => {
        if (percentage <= 45) {
            return '#28a745'; // Green
        } else if (percentage <= 70) {
            const r = Math.round(255 - (percentage - 45) * 4.2);
            const g = 255;
            const b = 0;
            return `rgb(${r},${g},${b})`; // Transition from green to yellow
        } else {
            const r = 255;
            const g = Math.round(255 - (percentage - 70) * 8.5);
            const b = 0;
            return `rgb(${r},${g},${b})`; // Transition from yellow to red
        }
    };

    const renderGauge = (value: number, type: string) => {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
            console.error(`Invalid value for ${type}:`, value);
            return null;
        }

        const color = interpolateColor(value);

        return (
            <div className="gauge">
                <CircularProgressbar
                    value={value}
                    styles={buildStyles({
                        textColor: '#333',
                        pathColor: color,
                        trailColor: '#f3f3f3',
                    })}
                />
                <div className="gauge-label">
                    <strong>{type}:</strong> {value}%
                </div>
            </div>
        );
    };

    const handleServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceName = event.target.value;
        const service = serverData?.services.find(s => s.name === serviceName);
        setSelectedService(service || null);
    };

    const handleServiceAction = async (action: string) => {
        if (selectedService) {
            const { serverId } = serverData ?? {}; // Get the serverId from serverData
            const serviceName = selectedService.name;

            try {
                const response = await fetch(`${proxyUrl}/api/server_Check/${serverId}/${serviceName}/${action}`, {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${action} the service`);
                }

                const result = await response.json();
                console.log(result); // Log the result

                const updatedServiceStatus = action === 'start' ? 'Running' : action === 'stop' ? 'Stopped' : 'Running';
                setSelectedService((prevState) => prevState ? { ...prevState, status: updatedServiceStatus } : null);

                if (serverData) {
                    const updatedServices = serverData.services.map(service =>
                        service.name === selectedService.name
                            ? { ...service, status: updatedServiceStatus }
                            : service
                    );
                    setServerData((prevState) =>
                        prevState ? { ...prevState, services: updatedServices } : null
                    );
                }
            } catch (error) {
                console.error(`Error during ${action} action:`, error);
            }
        }
    };

    const toggleServiceStatus = async () => {
        if (selectedService) {
            const { serverId } = serverData ?? {}; // Get the serverId from serverData
            const serviceName = selectedService.name;

            let action = '';
            let updatedServiceStatus = '';

            if (selectedService.status === 'Disabled') {
                action = 'enable';
                updatedServiceStatus = 'Stopped';
            } else {
                action = 'disable';
                updatedServiceStatus = 'Disabled';
            }

            try {
                const response = await fetch(`${proxyUrl}/api/server_Check/${serverId}/${serviceName}/${action}`, {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${action} the service`);
                }

                const result = await response.json();
                console.log(result); // Log the result

                setSelectedService((prevState) =>
                    prevState ? { ...prevState, status: updatedServiceStatus } : null
                );

                if (serverData) {
                    const updatedServices = serverData.services.map((service) =>
                        service.name === selectedService.name
                            ? { ...service, status: updatedServiceStatus }
                            : service
                    );
                    setServerData((prevState) =>
                        prevState ? { ...prevState, services: updatedServices } : null
                    );
                }
            } catch (error) {
                console.error(`Error during ${action} action:`, error);
            }
        }
    };

    const sortedServices = serverData?.services.sort((a, b) => {
        if (a.status === 'Stopped') return -1;
        if (b.status === 'Stopped') return 1;
        if (a.status === 'Running') return -1;
        if (b.status === 'Running') return 1;
        return 0;
    });

    const getServiceStyle = (status: string) => {
        if (status === 'Stopped') {
            return { color: 'red', fontWeight: 'bold' }; // Red for Stopped
        } else if (status === 'Disabled') {
            return { color: '#d3d3d3' }; // Lighter shade for Disabled
        } else {
            return {}; // Default style for Running
        }
    };

    return (
        <div className={`card ${loading ? 'loading' : ''} ${isExpanded ? 'expanded' : ''}`}>
            <div
                className="card-header"
                onClick={() => setIsOpen(!isExpanded)} // Disable click when loading
            >
                <h3 className="card-title">{serverName}</h3>
                <span className={`server-status ${status.toLowerCase()}`}>{status}</span>
            </div>
            {loading && <div className="loading-indicator">Loading...</div>}
            {isOpen && serverData && !loading && (
                <div className="card-content">
                    <div className="gauges-container">
                        <div className="gauge-item">
                            {renderGauge(
                                serverData.systemStats?.cpu ?? 0, 
                                'CPU Usage'
                            )}
                        </div>
                        <div className="gauge-item">
                            {renderGauge(
                                serverData.systemStats?.memory ?? 0, 
                                'Memory Usage'
                            )}
                        </div>
                    </div>

                    {sortedServices && sortedServices.length > 0 ? (
                        <div className="services">
                            <h4>Services</h4>
                            <select defaultValue="" onChange={handleServiceChange}>
                                <option value="" disabled>Select a Service</option>
                                {sortedServices.map((service, index) => (
                                    <option
                                        key={index}
                                        value={service.name}
                                        style={getServiceStyle(service.status)}
                                    >
                                        {service.name}: {service.status}
                                    </option>
                                ))}
                            </select>

                            <hr />

                            {selectedService && (
                                <div className="service-details">
                                    <h5>{selectedService.name}</h5>
                                    <p>Uptime: {selectedService.uptime}</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleServiceAction('start')}>Start</button>
                                        <button onClick={() => handleServiceAction('stop')}>Stop</button>
                                        <button onClick={() => handleServiceAction('restart')}>Restart</button>
                                        <button onClick={toggleServiceStatus}>
                                            {selectedService.status === 'Disabled' ? 'Enable' : 'Disable'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No services available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Card;
