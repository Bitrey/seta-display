import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";

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
    // agencyLogo?: string; // Small logo (icon size)
    canceled?: boolean; // Defaults to false
    additionalInfo?: string; // Scrolling text
    backgroundColor?: string; // HEX color - has no effect on LED matrix displays
    textColor?: string; // HEX color - has no effect on LED matrix displays
}
*/

class Timetable extends Component {
    static propTypes = {
        stop: PropTypes.string
    };
    // static defaultProps = {
    //   stop: null
    // }

    state /*: { trips: Trip[] | null }*/ = {
        trips: null
    };

    async componentDidMount() {
        const url = "/api/" + this.props.stop;
        console.log(`fetcho ${url}`);
        const { data } = await axios.get(url);
        console.log(data);
        this.setState({ trips: data });
    }

    render() {
        return (
            <div>
                <pre>
                    <code>
                        {this.state.trips
                            ? JSON.stringify(this.state.trips, null, 4)
                            : "caricamento..."}
                    </code>
                </pre>
            </div>
        );
    }
}

export default Timetable;