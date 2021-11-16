import "./App.css";
import Timetable from "./components/Timetable3.jsx";
import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

const agency = ["seta"];
const stopName = "San Cesario";
const stopId = ["MO2076", "MO3600"];
const limit = 10;

function App() {
    /** @type {[Trip[] | null, React.Dispatch<Trip[]>]} */
    const [trips, setTrips] = useState(null);
    const [reqErr, setReqErr] = useState(null);
    const [updateDate, setUpdateDate] = useState(null);
    const [updateTimeout, setUpdateTimeout] = useState(null);
    const [isTimeoutGoing, setTimeoutGoing] = useState(false);

    const [time, setTime] = useState(null);

    useEffect(() => {
        async function getData() {
            try {
                // console.log("getData");
                const { data } = await axios.post("/api/stop", {
                    agency,
                    stopId,
                    limit
                });
                setTrips(data);
                getTime();
                console.log({ data });
                if (updateTimeout) clearTimeout(updateTimeout);

                setTimeoutGoing(false);
            } catch (err) {
                setReqErr(
                    err?.response?.data?.err?.toString() || err.toString()
                );
                console.log(err, err?.response);
            }
        }
        if (!isTimeoutGoing) {
            // console.log("start timeout");
            const delay =
                !updateDate || moment().diff(updateDate, "seconds") > 30
                    ? 0
                    : 30;
            setUpdateTimeout(setTimeout(getData, delay * 1000));
            setUpdateDate(moment().add(!updateDate ? delay : "seconds"));
            setTimeoutGoing(true);
        }

        async function getTime() {
            try {
                const res = await axios.post("/api/time", {
                    agency: Array.isArray(agency) ? agency[0] : agency,
                    format: "DD/MM/YYYY HH:mm"
                });
                console.log(res.data);
                setTime(res.data.time);
            } catch (err) {
                if (err?.response?.data?.err) {
                    setTime(err?.response?.data?.err || null);
                    console.log(err);
                } else {
                    setTime(null);
                    console.error(err);
                }
            }
        }
    }, [isTimeoutGoing, updateTimeout, updateDate]);

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
                        reqErr={reqErr}
                        stopId={stopId}
                        limit={limit}
                        time={time}
                    />
                </div>
            </div>
            {/* <Timetable2 agency="tper" stopId="659004" /> */}
            {/* </div> */}
        </div>
    );
}

export default App;
