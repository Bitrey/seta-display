import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

/**
 * @typedef Trip
 * @prop {string} tripId ID of this trip
 * @prop {string} shortName Route number
 * @prop {string} longName Route destination
 * @prop {string} vehicleType See route_type in https://developers.google.com/transit/gtfs/reference#routestxt
 * @prop {string} scheduledArrival UNIX Timestamp - can be the same as arrivalTime
 * @prop {string} scheduledDeparture UNIX Timestamp - can be the same as departureTime
 * @prop {string} scheduleRelationship See https://developers.google.com/transit/gtfs-realtime/reference#enum-schedulerelationship
 * @prop {string} realtimeArrival UNIX Timestamp - can be the same as arrivalTime
 * @prop {string} realtimeDeparture UNIX Timestamp - can be the same as departureTime
 * @prop {string} platform Visible only if enabled in settings
 * @prop {string} occupancyStatus
 * @prop {string} passengersNum
 * @prop {string} maxPassengers
 * @prop {string} vehicleCode
 * @prop {string} canceled Defaults to false
 * @prop {string} additionalInfo Scrolling text
 * @prop {string} backgroundColor HEX color - has no effect on LED matrix displays
 * @prop {string} textColor HEX color - has no effect on LED matrix displays
 * @prop {string} minTillArrival for stupid devices
 */

const Timetable = props => {
    /** @type {string} */
    const agency = props.agency;

    /** @type {number} */
    const limit = props.agency;

    /** @type {string | string[]} */
    const stopId = props.stopId;

    /** @type {string} */
    const stopName = props.stopName;

    /** @type {[Trip[] | null, React.Dispatch<Trip[]>]} */
    const [trips, setTrips] = useState(null);
    const [updateDate, setUpdateDate] = useState(null);
    const [updateTimeout, setUpdateTimeout] = useState(null);
    const [isTimeoutGoing, setTimeoutGoing] = useState(false);

    useEffect(() => {
        async function getData() {
            try {
                console.log("getData");
                const { data } = await axios.post("/api/stop", {
                    agency,
                    stopId,
                    limit
                });
                setTrips(data);
                if (updateTimeout) clearTimeout(updateTimeout);

                setTimeoutGoing(false);
            } catch (err) {
                console.log(err, err?.response);
            }
        }
        if (!isTimeoutGoing) {
            console.log("start timeout");
            const delay =
                !updateDate || moment().diff(updateDate, "seconds") > 30
                    ? 0
                    : 30;
            setUpdateTimeout(setTimeout(getData, delay * 1000));
            setUpdateDate(moment().add(!updateDate ? delay : "seconds"));
            setTimeoutGoing(true);
        }
    }, [isTimeoutGoing, agency, stopId, limit, updateTimeout, updateDate]);

    return (
        <div className="w-full flex rounded-2xl h-full overflow-hidden bg-white">
            <div className="w-full flex flex-col text-white">
                <div className="w-full flex flex-col bg-gray-900 py-3 px-6">
                    <p className="text-2xl font-semibold">{stopName}</p>
                </div>
                <div className="w-full flex flex-col bg-gray-700 py-2 px-4">
                    <div className="flex ml-auto items-center">
                        <p className="font-light mr-2">Codice fermata</p>
                        <p>
                            {Array.isArray(stopId) ? stopId.join(", ") : stopId}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center w-full p-6 my-2 lg:my-8 justify-center">
                    <div className="flex justify-center mr-6">
                        <img
                            src="/img/moovit2.png"
                            alt="Moovit"
                            className="w-full max-w-xs object-contain mr-3"
                        />
                        <img
                            src="/img/download-app.png"
                            alt="Download app"
                            className="max-h-24 object-contain ml-3"
                        />
                    </div>

                    <div className="flex flex-col mb-2 ml-6">
                        <p className="text-gray-700 text-3xl">
                            Pianifica il tuo viaggio
                        </p>
                        <p className="text-black mt-2 max-w-sm">
                            Lorem ipsum dolor, sit amet consectetur adipisicing
                            elit. A deleniti eius, odit molestias, quo totam
                            unde expedita.
                        </p>
                    </div>
                </div>

                <div className="w-full rounded-2xl overflow-hidden h-full">
                    <div className="w-full flex text-left bg-gray-700 text-white px-6 py-3 font-light">
                        <p className="w-32 mr-3">Linea</p>
                        <p className="w-screen max-w-xs mr-3">Destinazione</p>
                        <p>Min. all'arrivo</p>
                    </div>
                    <div className="w-full flex flex-col h-full bg-gray-100 text-black">
                        {trips ? (
                            trips.map((t, i) => {
                                return (
                                    <div
                                        key={i}
                                        className={`w-full flex flex-row items-center px-6 py-2 ${
                                            i % 2 === 1 ? "bg-gray-200" : ""
                                        }`}
                                    >
                                        <p className="w-32 font-semibold text-4xl mr-3">
                                            {t.shortName}
                                        </p>
                                        <p className="w-screen text-xl max-w-xs mr-3">
                                            {t.longName}
                                        </p>
                                        <p className="font-semibold text-xl">
                                            {t.minTillArrival}
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p>caricamento...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
