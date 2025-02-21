import { useEffect, useState } from "react";

/**
 * Custom hook which triggers a callback for deadline alerts.
 *
 * @param {string|Date} deadline - The task deadline.
 * @param {string} status - The task status (e.g., "Pending", "In Progress", "Completed").
 * @param {function} onAlert - Callback function to invoke when an alert should be shown.
 */
function useDeadlineAlerts(deadline, status, onAlert) {
    const [alertsTriggered, setAlertsTriggered] = useState({
        week: false,
        day: false,
        hour: false,
    });

    useEffect(() => {
        if (status === "Completed") {
            return;
        }

        const deadlineDate = new Date(deadline);

        const checkThresholds = () => {
            if (status === "Completed") {
                return;
            }

            const now = new Date();
            const diff = deadlineDate - now;

            if (diff <= 0) {
                return;
            }

            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const oneDay = 24 * 60 * 60 * 1000;
            const oneHour = 60 * 60 * 1000;

            if (!alertsTriggered.week && diff <= oneWeek) {
                onAlert("Less than one week remaining to complete the task!");
                setAlertsTriggered((prev) => ({ ...prev, week: true }));
            }

            if (!alertsTriggered.day && diff <= oneDay) {
                onAlert("Less than one day remaining to complete the task!");
                setAlertsTriggered((prev) => ({ ...prev, day: true }));
            }

            if (!alertsTriggered.hour && diff <= oneHour) {
                onAlert("Less than one hour remaining to complete the task!");
                setAlertsTriggered((prev) => ({ ...prev, hour: true }));
            }
        };

        // Increase interval time if needed
        const intervalId = setInterval(checkThresholds, 1000);
        return () => clearInterval(intervalId);
    }, [deadline, status, alertsTriggered, onAlert]);
}

export default useDeadlineAlerts;