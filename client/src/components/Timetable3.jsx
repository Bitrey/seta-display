import React from "react";
import Topbar from "./Topbar";
import AdBanner from "./AdBanner";

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

    /** @type {string | null} */
    const time = props.time;

    return (
        <div className="w-full flex rounded-2xl h-full overflow-hidden bg-white">
            <div className="w-full flex flex-col text-white">
                <Topbar
                    agency={Array.isArray(agency) ? agency[0] : agency}
                    stopId={stopId}
                    stopName={stopName}
                    time={time}
                />
                <AdBanner />

                <div className="w-full rounded-2xl overflow-hidden h-full">
                    <div className="w-full flex text-left bg-gray-700 text-white px-6 py-3 font-light">
                        <p className="w-32 mr-3">Linea</p>
                        <p className="w-screen max-w-xs mr-3">Destinazione</p>
                        <p>Min. all'arrivo</p>
                    </div>
                    <div className="w-full flex flex-col h-full bg-gray-100 text-black">
                        {trips
                            ? trips.map((t, i) => {
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
                            : (reqErr && (
                                  <div className="w-full bg-red-500 mb-4 text-white p-4 h-full">
                                      <p className="font-semibold">Error</p>
                                      <p>{reqErr}</p>
                                  </div>
                              )) || <p className="p-3">caricamento...</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
