import "./App.css";
import Timetable from "./components/Timetable3.jsx";
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone";

function App() {
    const [trips, setTrips] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [lastUpdateTimeout, setLastUpdateTimeout] = useState(null);
    const [isTimeoutGoing, setTimeoutGoing] = useState(null);
    useEffect(() => {
        async function getData() {
            try {
                console.log("getData");
                const { data } = await axios.post("/api/stop", {
                    agency: ["seta", "tper"],
                    stopId: [
                        "MO2076",
                        "MO3600",
                        "659003",
                        "MO5003",
                        "MO6120",
                        "MO6121",
                        "MO8577",
                        "MOMO1001"
                    ]
                });
                setTrips(data);
                if (lastUpdateTimeout) clearTimeout(lastUpdateTimeout);

                setTimeoutGoing(false);
            } catch (err) {
                console.log(err, err?.response);
            }
        }
        if (!isTimeoutGoing) {
            console.log("start timeout");
            const delay =
                !lastUpdate || moment().diff(lastUpdate, "seconds") > 30
                    ? 0
                    : 30;
            setLastUpdateTimeout(setTimeout(getData, delay * 1000));
            setLastUpdate(moment().add(!lastUpdate ? delay : "seconds"));
            setTimeoutGoing(true);
        }
    }, [isTimeoutGoing, lastUpdateTimeout, lastUpdate]);

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
                        trips={trips}
                        agency={'["seta"]'}
                        stopId={'["MO5003"]'}
                    />
                </div>
            </div>
            {/* <Timetable2 agency="tper" stopId="659004" /> */}
            {/* </div> */}
        </div>
    );
}

export default App;
