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
            } else {
                this.setState({ err: "Unknown error" });
                console.error(err);
            }
            console.log(this.state.err);
        }
    }

    render() {
        return (
            <div
                className={
                    "text-yellow-200 w-full p-4 " + (this.props.className || "")
                }
            >
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <p className="text-xl">Ti trovi alla fermata</p>
                        <p className="text-5xl">San Cesario</p>
                    </div>
                    <div className="flex flex-col text-right">
                        <p className="text-xl">27/10/2021</p>
                        <p className="text-5xl">10:25</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Timetable;
