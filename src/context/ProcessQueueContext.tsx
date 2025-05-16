import React, { createContext, useState, useContext, ReactNode } from "react";

interface Process {
    processId: string;
    status: string;
    transactionType?: string;
    year?: string;
    month?: string;
}

interface ProcessQueueContextType {
    queue: Process[];
    addToQueue: (process: Process) => void;
}

const ProcessQueueContext = createContext<ProcessQueueContextType | undefined>(undefined);

export const ProcessQueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [queue, setQueue] = useState<Process[]>([]);

    const addToQueue = (process: Process) => {
        setQueue((prevQueue) => {
            const existingProcessIndex = prevQueue.findIndex(p => p.processId === process.processId);
            if (existingProcessIndex !== -1) {
                // Update existing process instead of adding a duplicate
                const updatedQueue = [...prevQueue];
                updatedQueue[existingProcessIndex] = { ...prevQueue[existingProcessIndex], ...process };
                return updatedQueue;
            } else {
                return [...prevQueue, process].slice(-5); // Limit queue size to last 5
            }
        });
    };

    return (
        <ProcessQueueContext.Provider value={{ queue, addToQueue }}>
            {children}
        </ProcessQueueContext.Provider>
    );
};

export const useProcessQueue = (): ProcessQueueContextType => {
    const context = useContext(ProcessQueueContext);
    if (!context) {
        throw new Error("useProcessQueue must be used within a ProcessQueueProvider");
    }
    return context;
};
