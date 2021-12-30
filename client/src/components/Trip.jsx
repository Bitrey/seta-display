import React from "react";

const Trip = ({ i, t }) => {
    return (
        <div
            className={`w-full grid grid-cols-6 items-center px-6 py-2 ${
                i % 2 === 1 ? "bg-gray-200" : ""
            }`}
        >
            <p className="w-32 font-semibold text-2xl mr-3">{t.shortName}</p>
            <p className="w-screen text-lg max-w-xs mr-3 col-span-3">
                {t.longName}
            </p>
            <p className="font-semibold text-lg col-span-2">
                {t.minTillArrival > 60
                    ? `${Math.floor(t.minTillArrival / 60)}h ${
                          t.minTillArrival % 60
                      }m`
                    : t.minTillArrival + "m"}
                {t.scheduleRelationship !== "SCHEDULED" && "*"}
            </p>
        </div>
    );
};

export default Trip;