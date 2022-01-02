import React, { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import "./App.css";
import Timetable from "./components/Timetable3.jsx";

const tripsArgs = {
    agency: ["seta", "tper"],
    stopName: "San Cesario",
    stopId: [
        "MO2076",
        "MO3600",
        "68041",
        "68042",
        // "MO506",
        "MO6119",
        "MO6132",
        "MO6133",
        "MO6134"
        // "MO8537",
        // "MO8576"
        // 1,
        // 2,
        // 3,
        // 4,
        // 5,
        // 6,
        // 7,
        // 8,
        // 9
    ],
    limit: 10
};

const newsArgs = {
    agency: ["seta", "tper"],
    type: "bologna",
    fromDate: "2019-12-31T23:00:00.000Z",
    limit: 10
};

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
    const [news, setNews] = useState(null);
    const [tripsReqErr, setTripsReqErr] = useState(null);
    const [newsReqErr, setNewsReqErr] = useState(null);
    const [tripsJobName, setTripsJobName] = useState(null);
    const [newsJobName, setNewsJobName] = useState(null);
    const [tripsLoaded, setTripsLoaded] = useState(false);
    const [newsLoaded, setNewsLoaded] = useState(false);

    const width = useWindowWidth();

    document
        .querySelectorAll(".scroll-text")
        .forEach(e => (e.style.animationDuration = `${width / 30}s`));

    useEffect(() => {
        async function getTrips() {
            try {
                setTripsLoaded(false);
                const { data } = await axios.post("/api/trips", tripsArgs);
                setTrips(data);
                setTripsReqErr(null);
                console.log(data);
            } catch (err) {
                setTripsReqErr(
                    err?.response?.data?.err?.toString() || err.toString()
                );
                console.log(err, err?.response);
            } finally {
                setTripsLoaded(true);
            }
        }
        if (!tripsJobName) {
            const _job = scheduleJob("0 * * * * *", getTrips);
            setTripsJobName(_job.name);
            getTrips();
        }
    }, [tripsJobName]);

    useEffect(() => {
        async function getNews() {
            try {
                setNewsLoaded(false);
                const { data } = await axios.post("/api/news", newsArgs);
                setNews(data);
                setNewsReqErr(null);
                console.log(data);
            } catch (err) {
                setNewsReqErr(
                    err?.response?.data?.err?.toString() || err.toString()
                );
                console.log(err, err?.response);
            } finally {
                setNewsLoaded(true);
            }
        }
        if (!newsJobName) {
            const _job = scheduleJob("0 * * * * *", getNews);
            setNewsJobName(_job.name);
            getNews();
        }
    }, [newsJobName]);

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
                        agency={tripsArgs.agency}
                        stopName={tripsArgs.stopName}
                        trips={trips}
                        tripsLoaded={tripsLoaded}
                        tripsReqErr={tripsReqErr}
                        stopId={tripsArgs.stopId}
                        limit={tripsArgs.limit}
                        news={news}
                        newsLoaded={newsLoaded}
                        newsReqErr={newsReqErr}
                    />
                </div>
            </div>
            {/* <Timetable2 agency="tper" stopId="659004" /> */}
            {/* </div> */}
        </div>
    );
}

export default App;
