
declare module 'node-schedule' {
    const schedule: any;
    export default schedule;
}

declare module 'unzipper' {
    export const Extract: (options: { path: string }) => NodeJS.WritableStream;
}
