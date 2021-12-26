import React, { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import "./App.css";
import Timetable from "./components/Timetable3.jsx";

const agency = ["seta", "tper"];
const stopName = "San Cesario";
const stopId = [
    "MO2076",
    "MO3600",
    "68041",
    "68042",
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
];
const limit = 10;

const useWindowWidth = () => {
    const [size, setSize] = useState(0);
    useLayoutEffect(() => {
        const updateSize = () => {
            setSize(window.innerWidth);
        };
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
};

function App() {
    /** @type {[Trip[] | null, React.Dispatch<Trip[]>]} */
    const [trips, setTrips] = useState(null);
    const [reqErr, setReqErr] = useState(null);
    const [jobName, setJobName] = useState(null);
    const [tripsLoaded, setTripsLoaded] = useState(false);

    const width = useWindowWidth();

    document
        .querySelectorAll(".scroll-text")
        .forEach(e => (e.style.animationDuration = `${width / 30}s`));

    useEffect(() => {
        async function getData() {
            try {
                setTripsLoaded(false);
                const { data } = await axios.post("/api/stop", {
                    agency,
                    stopId,
                    limit
                });
                setTrips(data);
                setTripsLoaded(true);
                console.log(data);
            } catch (err) {
                setReqErr(
                    err?.response?.data?.err?.toString() || err.toString()
                );
                console.log(err, err?.response);
            }
        }
        if (!jobName) {
            const _job = scheduleJob("0 * * * * *", getData);
            setJobName(_job.name);
            getData();
        }
    }, [jobName]);

    return (
        <div className="App">
            {/* <div className="flex flex-col justify-center items-start w-full min-h-screen bg-black text-yellow-200"> */}
            {/* <Topbar agency="seta" /> */}
            {/* <Timetable
                    agency={'["seta"]'}
                    stopId={'["MO2076", "MO6102"]'}
                /> */}
            <div className="py-6 flex w-full h-full min-h-screen justify-center bg-gray-200">
                <div className="w-5/6">
                    <Timetable
                        agency={agency}
                        stopName={stopName}
                        trips={trips}
                        tripsLoaded={tripsLoaded}
                        reqErr={reqErr}
                        stopId={stopId}
                        limit={limit}
                    />
                </div>
            </div>
            {/* <Timetable2 agency="tper" stopId="659004" /> */}
            {/* </div> */}
        </div>
    );
}

export default App;
