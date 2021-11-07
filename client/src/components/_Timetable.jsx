import React, { Component } from "react";
import axios from "axios";
import moment from "moment-timezone";
// import PropTypes from "prop-types";

/*
export interface Trip {
    tripId?: string;
    shortName: string; // Route number
    longName: string; // Route destination
    vehicleType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // See route_type in https://developers.google.com/transit/gtfs/reference#routestxt
    scheduledArrival: number; // UNIX Timestamp - can be the same as arrivalTime
    scheduledDeparture: number; // UNIX Timestamp - can be the same as departureTime
    scheduleRelationship: "SCHEDULED" | "SKIPPED" | "NO_DATA"; // See https://developers.google.com/transit/gtfs-realtime/reference#enum-schedulerelationship
    realtimeArrival: number; // UNIX Timestamp - can be the same as arrivalTime
    realtimeDeparture: number; // UNIX Timestamp - can be the same as departureTime
    platform?: string; // Visible only if enabled in settings
    occupancyStatus?:
        | "EMPTY"
        | "MANY_SEATS_AVAILABLE"
        | "FEW_SEATS_AVAILABLE"
        | "STANDING_ROOM_ONLY"
        | "CRUSHED_STANDING_ROOM_ONLY"
        | "FULL"
        | "NOT_ACCEPTING_PASSENGERS";
    passengersNum?: number;
    maxPassengers?: number;
    vehicleCode?: string;
    canceled?: boolean; // Defaults to false
    additionalInfo?: string; // Scrolling text
    backgroundColor?: string; // HEX color - has no effect on LED matrix displays
    textColor?: string; // HEX color - has no effect on LED matrix displays
}
*/

class Timetable extends Component {
    // static propTypes = {
    //     agency: PropTypes.oneOf([
    //         PropTypes.string,
    //         PropTypes.arrayOf(PropTypes.string)
    //     ]).isRequired,
    //     stopId: PropTypes.oneOf([
    //         PropTypes.string,
    //         PropTypes.arrayOf(PropTypes.string)
    //     ]).isRequired
    // };

    state /*: { trips: Trip[] | null }*/ = {
        trips: null,
        err: null
    };

    async componentDidMount() {
        try {
            console.log(this.props);
            const res = await axios.post("/api/stop", {
                agency: this.props.agency,
                stopId: this.props.stopId
            });
            this.setState({ trips: res.data });
        } catch (err) {
            if (err?.response?.data?.err) {
                this.setState({ err: err.response.data.err });
                console.log(this.state.err);
            } else {
                this.setState({ err: "Unknown error" });
                console.error(err);
            }
        }
    }

    render() {
        return (
            <div className="text-yellow-200 w-full">
                {this.state.err ? (
                    JSON.stringify(this.state.err)
                ) : this.state.trips ? (
                    <div className="w-full">
                        <div className="grid grid-cols-1">
                            <div className="grid grid-cols-3 mb-3">
                                <p>Linea</p>
                                <p>Destinazione</p>
                                <p>Minuti all'arrivo</p>
                            </div>
                            {this.state.trips.map(t => (
                                <div
                                    className="grid grid-cols-3"
                                    key={t.tripId}
                                >
                                    <p className="mb-2">{t.shortName}</p>
                                    <p>{t.longName}</p>
                                    <p>
                                        {moment
                                            .unix(
                                                t.realtimeDeparture ||
                                                    t.scheduledDeparture
                                            )
                                            .diff(moment(), "minutes")}
                                        {t.scheduleRelationship !== "SCHEDULED"
                                            ? "*"
                                            : ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    "caricamento..."
                )}

                {/* <div className="w-full flex "></div> */}
                {/* <pre>
                    <code>
                        {this.state.err
                            ? JSON.stringify(this.state.err)
                            : this.state.trips
                            ? JSON.stringify(this.state.trips, null, 4)
                            : "caricamento..."}
                    </code>
                </pre> */}
            </div>
        );
    }
}

export default Timetable;
