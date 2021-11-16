import React, { Component } from "react";

class Topbar extends Component {
    render() {
        const { time, stopId, stopName } = this.props;
        return (
            <>
                <div className="w-full flex flex-row items-center justify-between bg-gray-900 py-3 px-6">
                    <p className="text-2xl font-semibold">{stopName}</p>
                    <p className="font-light">{time || "Caricamento..."}</p>
                </div>
                <div className="w-full flex flex-col bg-gray-700 py-2 px-4">
                    <div className="flex ml-auto items-center">
                        <p className="font-light mr-2">Codice fermata</p>
                        <p>
                            {Array.isArray(stopId) ? stopId.join(", ") : stopId}
                        </p>
                    </div>
                </div>
            </>
        );
    }
}

export default Topbar;
