import React from "react";

const Trip = ({ i, t }) => {
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
            <p className="w-screen text-lg max-w-xs col-span-3">{t.longName}</p>
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
