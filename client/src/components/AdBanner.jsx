import React, { useEffect, useState } from "react";
import axios from "axios";

const AdBanner = ({ img, name, description, className }) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadAds() {
            console.log("loading ads");
            setLoading(true);
            const { data } = await axios.post("/api/ads", { agency: "seta" });
            console.log("ads", data);
            setAds(data);
            setLoading(false);
        }
        loadAds();
    }, [ads.length]);
    return (
        <div
            className={`flex flex-col h-full bg-gray-100 items-center w-full p-6 justify-center ${
                className || ""
            }`}
        >
            <div className="flex justify-center mr-6 max-w-full">
                <img
                    src="/img/moovit2.png"
                    alt="Moovit"
                    className="w-full max-w-xs object-contain mr-3"
                    loading="lazy"
                />
                <img
                    src="/img/download-app.png"
                    alt="Download app"
                    className="max-h-24 object-contain ml-3"
                    loading="lazy"
                />
            </div>

            <div className="flex flex-col mb-2 ml-6 lg:mb-0 lg:ml-0 lg:mt-4">
                <p className="text-gray-700 text-3xl">Pianifica il tuo viaggio</p>
                <p className="text-black mt-2 max-w-sm">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. A deleniti eius, odit
                    molestias, quo totam unde expedita.
                </p>
            </div>
        </div>
    );
};

export default AdBanner;
