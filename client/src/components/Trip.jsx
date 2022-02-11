import React from "react";
import moment from "moment-timezone";

const Trip = ({ i, t }) => {
    const delay =
        t.scheduleRelationship === "SCHEDULED" &&
        moment
            .unix(t.realtimeDeparture)
            .diff(moment.unix(t.scheduledDeparture), "minutes");

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
            <p className="font-semibold text-lg">
                {moment
                    .unix(t.realtimeDeparture || t.scheduledDeparture)
                    .diff(moment(), "m") + "m"}
                {t.scheduleRelationship !== "SCHEDULED" && "*"}
            </p>
            <p className="text-lg">
                {delay ? (delay > 0 ? "+" + delay : delay) + "m" : "-"}
            </p>
        </div>
    );
};

export default Trip;
