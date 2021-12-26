import React from "react";
import Topbar from "./Topbar";
import AdBanner from "./AdBanner";
import Trip from "./Trip";

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
    /** @type {Trip[]} */
    const trips = props.trips;

    /** @type {boolean} */
    const tripsLoaded = props.tripsLoaded;

    /** @type {string} */
    const agency = props.agency;

    /** @type {string | null} */
    const reqErr = props.reqErr;

    // /** @type {number} */
    // const limit = props.limit;

    /** @type {string | string[]} */
    const stopId = props.stopId;

    /** @type {string} */
    const stopName = props.stopName;

    return (
        <div className="w-full flex rounded-2xl h-full overflow-hidden bg-white">
            <div className="w-full flex flex-col text-white">
                <Topbar
                    agency={Array.isArray(agency) ? agency[0] : agency}
                    stopId={stopId}
                    stopName={stopName}
                />
                <div className="w-full grid grid-cols-1 md:grid-cols-2 h-full">
                    <AdBanner className="order-2 md:order-1" />

                    <div className="order-1 md:order-2 bg-gray-100 auto-rows-min overflow-hidden h-full grid grid-cols-3">
                        {trips ? (
                            <div className="w-full text-left bg-gray-700 col-span-3 grid grid-cols-3 text-white px-6 py-3 font-light">
                                <p className="mr-3 text-lg">Linea</p>
                                <p className="mr-3 text-lg">Destinazione</p>
                                <p className="text-lg">Tempo all'arrivo</p>
                            </div>
                        ) : (
                            !reqErr && (
                                <div className="w-full text-left bg-gray-700 col-span-3 text-white px-6 py-3 font-light">
                                    <p className="text-lg">Caricamento...</p>
                                </div>
                            )
                        )}
                        <div className="w-full col-span-3 flex flex-col h-full bg-gray-100 text-black">
                            {Array.isArray(trips) && trips.length >= 1 ? (
                                trips.map((t, i) => <Trip t={t} i={i} />)
                            ) : reqErr ? (
                                <div className="w-full bg-red-500 text-white p-4">
                                    <p className="font-semibold">Errore</p>
                                    <p>{reqErr}</p>
                                </div>
                            ) : (
                                tripsLoaded && (
                                    <p className="p-4">
                                        Nessuna corsa in programma
                                    </p>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
