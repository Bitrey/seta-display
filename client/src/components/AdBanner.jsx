import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/lazy";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import moment from "moment";

function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
}

const AdBanner = ({ img, name, description, className }) => {
    const [ads, setAds] = useState([]);
    const [width, setWidth] = useState("auto");
    const [height, setHeight] = useState("auto");
    const [wWidth, wHeight] = useWindowSize();
    const [currentAdIndex, setCurrentAdIndex] = useState(2);

    // const [loading, setLoading] = useState(false);

    async function loadAds() {
        console.log("loading ads");
        const { data } = await axios.post("/api/ads", { agency: "seta" });
        console.log("ads", data);
        setAds(data);
    }

    useEffect(() => {
        console.log("Ads job scheduled");
        const _loadAdsJob = scheduleJob("0 * * * * *", loadAds);
        if (moment(_loadAdsJob.nextInvocation()._date.ts).diff(moment(), "s") > 5) {
            loadAds();
        }
    }, []);

    const ref = useRef(null);

    useEffect(() => {
        console.log("h changed");
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
    }, [wWidth, wHeight]);

    function incrementIndex() {
        setCurrentAdIndex(currentAdIndex >= ads.length - 1 ? 0 : currentAdIndex + 1);
    }

    return (
        <div
            ref={ref}
            className={`flex flex-col h-full m-0 p-0 bg-gray-100 items-center w-full justify-center text-black ${
                className || ""
            }`}
        >
            {ads?.length && Number.isInteger(currentAdIndex) && (
                <div className="h-full w-full overflow-hidden">
                    {ads[currentAdIndex].type === "video" ? (
                        <ReactPlayer
                            width={"100%"}
                            height={"100%"}
                            loop={false} // DEBUG
                            // loop
                            url={ads[currentAdIndex].url}
                            playing
                            muted
                            style={{ maxWidth: width, maxHeight: height }}
                            onEnded={incrementIndex}
                        />
                    ) : ads[currentAdIndex].type === "image" ? (
                        <img
                            src={ads[currentAdIndex].url}
                            alt="Ad"
                            className="w-full h-full object-contain"
                            style={{ maxWidth: width, maxHeight: height }}
                            onLoad={() => setTimeout(incrementIndex, 10000)}
                            loading="lazy"
                        />
                    ) : (
                        <div>dio porco</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdBanner;
