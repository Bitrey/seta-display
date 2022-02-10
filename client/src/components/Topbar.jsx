import React from "react";
import Clock from "react-live-clock";
import NewsText from "./NewsText";

const Topbar = ({ stopId, stopName, news, newsLoaded, newsReqErr }) => {
    try {
        stopId = JSON.parse(stopId);
    } catch (err) {}
    return (
        <>
            <div className="w-full flex flex-row items-center justify-between bg-gray-900 py-3 px-6 max-h-36 lg:max-h-48">
                <div className="flex items-end max-h-full">
                    <p className="text-3xl font-semibold">{stopName}</p>
                    <div className="flex ml-3">
                        {/* <p className="font-light mr-2">Codice fermata</p> */}
                        <p className="font-light">
                            {Array.isArray(stopId) ? stopId.join(", ") : stopId}
                        </p>
                    </div>
                </div>
                <p className="font-light text-right">
                    <Clock
                        format={"DD/MM/YYYY HH:mm:ss"}
                        ticking={true}
                        timezone={"Europe/Rome"}
                    />
                    {/* {time || "Caricamento..."} */}
                </p>
            </div>
            <div
                className="w-full flex flex-col bg-gray-700 pt-4 pb-4 px-6 overflow-hidden box-content"
                style={{ minHeight: "1.5rem" }}
            >
                <NewsText
                    news={news}
                    newsLoaded={newsLoaded}
                    newsReqErr={newsReqErr}
                />
            </div>
        </>
    );
};

export default Topbar;
