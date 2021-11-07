import "./App.css";
import Timetable from "./components/Timetable3.jsx";
// import Timetable2 from "./components/_Timetable.js";
// import Topbar from "./components/Topbar";

const trips = [
    {
        tripId: "MO4-As-425-4141996",
        shortName: "4",
        longName: "GALILEI",
        vehicleType: 3,
        scheduledArrival: 1636312080,
        scheduledDeparture: 1636312080,
        scheduleRelationship: "SCHEDULED",
        realtimeArrival: 1636312140,
        realtimeDeparture: 1636312140,
        platform: null,
        occupancyStatus: "EMPTY",
        passengersNum: 3,
        maxPassengers: 102,
        vehicleCode: "285",
        canceled: false,
        backgroundColor: "#FFC100",
        textColor: "#FFFFFF",
        minTillArrival: 8
    },
    {
        tripId: "MO13-Di-1321-4589253",
        shortName: "13",
        longName: "_",
        vehicleType: 3,
        scheduledArrival: 1636312140,
        scheduledDeparture: 1636312140,
        scheduleRelationship: "NO_DATA",
        realtimeArrival: 1636312140,
        realtimeDeparture: 1636312140,
        platform: null,
        canceled: false,
        backgroundColor: "#FFC100",
        textColor: "#FFFFFF",
        minTillArrival: 8
    },
    {
        tripId: "MO13-As-1323-4589271",
        shortName: "13",
        longName: "_",
        vehicleType: 3,
        scheduledArrival: 1636312740,
        scheduledDeparture: 1636312740,
        scheduleRelationship: "NO_DATA",
        realtimeArrival: 1636312740,
        realtimeDeparture: 1636312740,
        platform: null,
        canceled: false,
        backgroundColor: "#FFC100",
        textColor: "#FFFFFF",
        minTillArrival: 18
    },
    {
        tripId: "MO760-Di-7835-3360561",
        shortName: "760",
        longName: "VIGNOLA",
        vehicleType: 3,
        scheduledArrival: 1636313400,
        scheduledDeparture: 1636313400,
        scheduleRelationship: "SCHEDULED",
        realtimeArrival: 1636313340,
        realtimeDeparture: 1636313340,
        platform: null,
        occupancyStatus: "MANY_SEATS_AVAILABLE",
        passengersNum: 10,
        maxPassengers: 83,
        vehicleCode: "369",
        canceled: false,
        backgroundColor: "#1267B7",
        textColor: "#FFFFFF",
        minTillArrival: 28
    },
    {
        tripId: "MO13-Di-1321-4589280",
        shortName: "13",
        longName: "_",
        vehicleType: 3,
        scheduledArrival: 1636313940,
        scheduledDeparture: 1636313940,
        scheduleRelationship: "NO_DATA",
        realtimeArrival: 1636313940,
        realtimeDeparture: 1636313940,
        platform: null,
        canceled: false,
        backgroundColor: "#FFC100",
        textColor: "#FFFFFF",
        minTillArrival: 38
    },
    {
        tripId: "MO13-As-1323-4589264",
        shortName: "13",
        longName: "_",
        vehicleType: 3,
        scheduledArrival: 1636314600,
        scheduledDeparture: 1636314600,
        scheduleRelationship: "NO_DATA",
        realtimeArrival: 1636314600,
        realtimeDeparture: 1636314600,
        platform: null,
        canceled: false,
        backgroundColor: "#FFC100",
        textColor: "#FFFFFF",
        minTillArrival: 49
    }
];
const trips2 = [
    {
        shortName: "21B",
        longName: "",
        realtimeArrival: 1636239780,
        realtimeDeparture: 1636239780,
        scheduledArrival: 1636239780,
        scheduledDeparture: 1636239780,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "958",
        minTillArrival: -1397
    },
    {
        shortName: "21",
        longName: "",
        realtimeArrival: 1636240920,
        realtimeDeparture: 1636240920,
        scheduledArrival: 1636240920,
        scheduledDeparture: 1636240920,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "6400",
        minTillArrival: -1378
    },
    {
        shortName: "21B",
        longName: "",
        realtimeArrival: 1636242180,
        realtimeDeparture: 1636242180,
        scheduledArrival: 1636242180,
        scheduledDeparture: 1636242180,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "6556",
        minTillArrival: -1357
    },
    {
        shortName: "25",
        longName: "",
        realtimeArrival: 1636324920,
        realtimeDeparture: 1636324920,
        scheduledArrival: 1636324920,
        scheduledDeparture: 1636324920,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "6540",
        minTillArrival: 20
    },
    {
        shortName: "21",
        longName: "",
        realtimeArrival: 1636325040,
        realtimeDeparture: 1636325040,
        scheduledArrival: 1636325040,
        scheduledDeparture: 1636325040,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "6556",
        minTillArrival: 23
    },
    {
        shortName: "25",
        longName: "",
        realtimeArrival: 1636325580,
        realtimeDeparture: 1636325580,
        scheduledArrival: 1636325580,
        scheduledDeparture: 1636325580,
        vehicleType: 3,
        scheduleRelationship: "SCHEDULED",
        vehicleCode: "6576",
        minTillArrival: 31
    }
];

function App() {
    return (
        <div className="App">
            {/* <div className="flex flex-col justify-center items-start w-full min-h-screen bg-black text-yellow-200"> */}
            {/* <Topbar agency="seta" /> */}
            {/* <Timetable
                    agency={'["seta"]'}
                    stopId={'["MO2076", "MO6102"]'}
                /> */}
            <div className="py-6 flex w-full h-full min-h-screen justify-center bg-gray-200">
                <div className="w-5/6">
                    <Timetable
                        trips={trips2}
                        agency={'["seta"]'}
                        stopId={'["MO5003"]'}
                    />
                </div>
            </div>
            {/* <Timetable2 agency="tper" stopId="659004" /> */}
            {/* </div> */}
        </div>
    );
}

export default App;
