/**
 * @swagger
 *  components:
 *    schemas:
 *      Trip:
 *        type: object
 *        required:
 *          - agencyName
 *          - tripId
 *          - shortName
 *          - longName
 *          - vehicleType
 *          - scheduledArrival
 *          - scheduledDeparture
 *          - scheduleRelationship
 *          - realtimeArrival
 *          - realtimeDeparture
 *          - maxPassengers
 *          - vehicleCode
 *          - canceled
 *          - backgroundColor
 *          - textColor
 *          - minTillArrival
 *        properties:
 *          agencyName:
 *            type: string
 *            description: Short name of the agency
 *            example: SETA
 *          logoUrl:
 *            type: string
 *            description: Small icon URL of the agency
 *            example: https://solweb.tper.it/resources/images/logo-t.png
 *          tripId:
 *            type: string
 *            description: ID of the trip
 *            example: MO760-Di-7742-4638671
 *          shortName:
 *            type: string
 *            description: Route number
 *            example: 760
 *          longName:
 *            type: string
 *            description: Route destination
 *            example: VIGNOLA
 *          vehicleType:
 *            type: integer
 *            minimum: 0
 *            maximum: 12
 *            description: Vehicle type as defined at https://developers.google.com/transit/gtfs/reference#routestxt
 *            example: 3
 *          scheduledArrival:
 *            type: integer
 *            description: Scheduled arrival time in epoch timestamp
 *            example: 1640696160
 *          scheduledDeparture:
 *            type: integer
 *            description: Scheduled arrival time in epoch timestamp
 *            example: 1640696160
 *          scheduleRelationship:
 *            type: string
 *            enum:
 *              - SCHEDULED
 *              - SKIPPED
 *              - NO_DATA
 *            description: Relationship between scheduled time and realtime as defined at https://developers.google.com/transit/gtfs-realtime/reference#enum-schedulerelationship
 *            example: SCHEDULED
 *          realtimeArrival:
 *            type: integer
 *            description: Realtime arrival time in epoch timestamp
 *            example: 1640696160
 *          realtimeDeparture:
 *            type: integer
 *            description: Realtime arrival time in epoch timestamp
 *            example: 1640696160
 *          maxPassengers:
 *            type: integer
 *            description: Maximum number of passengers allowed on board
 *            example: 84
 *          vehicleCode:
 *            type: string
 *            description: Vehicle code
 *            example: 348
 *          canceled:
 *            type: boolean
 *            description: Whether the trip is cancelled
 *            example: false
 *          backgroundColor:
 *            type: string
 *            format: hex
 *            description: Custom background color for clients that support it
 *            example: #1267B7
 *          textColor:
 *            type: string
 *            format: hex
 *            description: Custom text color for clients that support it
 *            example: #FFFFFF
 *          minTillArrival:
 *            type: integer
 *            minimum: 0
 *            description: Minutes till arrival, useful for devices that can't elaborate dates
 *            example: 1
 */

export interface Trip {
    tripId?: string;
    agencyName: string;
    logoUrl?: string;
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
    minTillArrival?: number; // for stupid devices
}
