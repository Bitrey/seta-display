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
                <div className="w-full flex flex-row">
                    <AdBanner />

                    <div className="bg-gray-400 overflow-hidden h-full grid grid-cols-3">
                        <div className="w-full text-left bg-gray-700 col-span-3 grid grid-cols-3 text-white px-6 py-3 font-light">
                            <p className="mr-3">Linea</p>
                            <p className="mr-3">Destinazione</p>
                            <p>Tempo all'arrivo</p>
                        </div>
                        <div className="w-full col-span-3 flex flex-col h-full bg-gray-100 text-black">
                            {trips
                                ? trips.map((t, i) => {
                                      return (
                                          <div
                                              key={i}
                                              className={`w-full grid grid-cols-3 items-center px-6 py-2 ${
                                                  i % 2 === 1
                                                      ? "bg-gray-200"
                                                      : ""
                                              }`}
                                          >
                                              <p className="w-32 font-semibold text-2xl mr-3">
                                                  {t.shortName}
                                              </p>
                                              <p className="w-screen text-lg max-w-xs mr-3">
                                                  {t.longName}
                                              </p>
                                              <p className="font-semibold text-lg">
                                                  {t.minTillArrival > 60
                                                      ? `${Math.floor(
                                                            t.minTillArrival /
                                                                60
                                                        )}h ${
                                                            t.minTillArrival %
                                                            60
                                                        }m`
                                                      : t.minTillArrival + "m"}
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
        </div>
    );
};

export default Timetable;
