import "./App.css";
import Timetable from "./components/Timetable.jsx";
import Topbar from "./components/Topbar";

function App() {
    return (
        <div className="App">
            <div className="flex flex-col justify-center items-start w-full min-h-screen bg-black text-yellow-200">
                <Topbar agency="seta" />
                <Timetable
                    agency={'["seta"]'}
                    stopId={'["MO2076", "MO6102"]'}
                />
            </div>
        </div>
    );
}

export default App;
