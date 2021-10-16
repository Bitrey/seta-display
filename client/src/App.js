import "./App.css";
import Timetable from "./components/Timetable";

function App() {
    return (
        <div className="App">
            <Timetable agency={'["seta"]'} stopId={'["MO2076", "MO3"]'} />
        </div>
    );
}

export default App;
