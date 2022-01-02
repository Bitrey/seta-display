import React, { Component } from "react";
import Clock from "react-live-clock";
import NewsText from "./NewsText";

class Topbar extends Component {
    render() {
        // eslint-disable-next-line no-unused-vars
        const { stopId, stopName, news, newsLoaded, newsReqErr } = this.props;
        return (
            <>
                <div className="w-full flex flex-row items-center justify-between bg-gray-900 py-3 px-6">
                    <div className="flex items-end">
                        <p className="text-3xl font-semibold">{stopName}</p>
                        <div className="flex ml-3">
                            {/* <p className="font-light mr-2">Codice fermata</p> */}
                            <p className="font-light">
                                {Array.isArray(stopId)
                                    ? stopId.join(", ")
                                    : stopId}
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
                <div className="w-full flex flex-col bg-gray-700 pt-4 pb-3 px-6 overflow-hidden">
                    <NewsText
                        news={news}
                        newsLoaded={newsLoaded}
                        newsReqErr={newsReqErr}
                    />
                </div>
            </>
        );
    }
}

export default Topbar;
