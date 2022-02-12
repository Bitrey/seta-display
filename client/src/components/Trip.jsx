import React from "react";
import moment from "moment-timezone";

const Trip = ({ i, t }) => {
    const arrival = moment
        .unix(t.realtimeDeparture || t.scheduledDeparture)
        .diff(moment(), "m");
    const delay =
        t.scheduledDeparture?.toString() !== "-1" &&
        t.scheduleRelationship === "SCHEDULED"
            ? moment
                  .unix(t.realtimeDeparture)
                  .diff(moment.unix(t.scheduledDeparture), "minutes")
            : null;

    return (
        <div
            className={`w-full grid grid-cols-6 items-center px-6 py-2 ${
                i % 2 === 1 ? "bg-gray-200" : ""
            }`}
        >
            <div className="grid grid-cols-4 items-center w-32 max-w-full font-semibold text-2xl">
                {t.logoUrl && (
                    <img
                        src={t.logoUrl}
                        alt="Agency logo"
                        className="object-contain max-h-5"
                        loading="lazy"
                    />
                )}
                {t.shortName}
            </div>
            <p className="w-full whitespace-nowrap overflow-hidden text-lg col-span-3 max-w-[fit-content] overflow-ellipsis">
                {t.longName}
            </p>
            <p className="font-semibold text-lg flex items-center">
                {arrival > 60
                    ? `${Math.floor(arrival / 60)}h ${arrival % 60}m`
                    : `${arrival}m`}
                {t.scheduleRelationship === "SCHEDULED" ? (
                    <img
                        src="/img/realtime.gif"
                        alt="Realtime"
                        loading="lazy"
                        className="w-4 h-4 p-0 mt-1 m-0 mr-1 transform rotate-45"
                    />
                ) : (
                    "*"
                )}
            </p>
            <p className="text-lg">
                {Number.isInteger(delay)
                    ? (delay > 0 ? "+" + delay : delay) + "m"
                    : "-"}
            </p>
        </div>
    );
};

export default Trip;
