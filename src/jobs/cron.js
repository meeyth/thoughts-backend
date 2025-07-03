import pingServerJob from './pingServer.job.js';

export const startJobs = () => {
    pingServerJob.start(); // Starts the job
};
