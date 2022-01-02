// const { default: axios } = require("axios");

function start() {
    // nothing
    getTrips("MO10");
}

async function getTrips(stopId) {
    const { data } = await axios.get("/api/" + stopId);
    if (data.err) {
        console.log("Errore", data.err);
    } else {
        console.log("OK!!", data);
        document.getElementById("status").textContent = JSON.stringify(
            data,
            null,
            4
        );
    }
}

start();
