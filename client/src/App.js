import React, { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import "./App.css";
import Timetable from "./components/Timetable.jsx";
import Cookies from "js-cookie";
import moment from "moment";

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
});

function getArg(argName, defaultValue) {
    if (params[argName]) {
        Cookies.set(
            argName,
            typeof params[argName] === "object"
                ? JSON.stringify(params[argName])
                : params[argName],
            { expires: 365 * 30 }
        );
    }
    let c = null;
    try {
        c = JSON.parse(Cookies.get(argName));
    } catch (err) {}

    return params[argName] || c || Cookies.get(argName) || defaultValue;
}

const tripsArgs = {
    agency: getArg("agency", ["seta", "tper"]),
    stopName: getArg("stopName", "San Cesario"),
    stopId: getArg("stopId", [
        "MO2076",
        "MO3600"
        // "68041",
        // "68042",
        // "MO506",
        // "MO6119",
        // "MO6132",
        // "MO6133",
        // "MO6134",
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
        // 9,
        // "MODMOMOV" // empty stop for testing
    ]),
    limit: getArg("limit", 10)
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
    const [ads, setAds] = useState(null);
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
        // refresh page every day
        console.log("reloading page in", 1000 * 60 * 60 * 24 + "ms");
        setTimeout(window.location.reload, 1000 * 60 * 60 * 24);
    }, []);

    useEffect(() => {
        async function getTrips() {
            try {
                setTripsLoaded(false);
                const { data } = await axios.post("/api/trips", tripsArgs);
                setTrips(data);
                setTripsReqErr(null);
                console.log("trips", data);
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
                console.log("news", data);
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

    async function loadAds() {
        console.log("loading ads");
        const { data } = await axios.post("/api/ads", { agency: "seta" });
        console.log("ads", data);
        setAds(data);
    }

    useEffect(() => {
        console.log("Ads job scheduled");
        const _loadAdsJob = scheduleJob("0 * * * * *", loadAds);
        if (
            moment(_loadAdsJob.nextInvocation()._date.ts).diff(moment(), "s") >
            5
        ) {
            loadAds();
        }
    }, []);

    return (
        <div className="App">
            <div className="w-screen h-screen">
                <Timetable
                    agency={tripsArgs.agency}
                    ads={ads}
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
    );
}

export default App;
