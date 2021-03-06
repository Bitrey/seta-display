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

const AdBanner = ({ ads, className }) => {
    const [width, setWidth] = useState("auto");
    const [height, setHeight] = useState("auto");
    const [wWidth, wHeight] = useWindowSize();
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    // const [loading, setLoading] = useState(false);

    const ref = useRef(null);

    useEffect(() => {
        console.log("h changed");
        setWidth(ref.current.clientWidth);
        setHeight(ref.current.clientHeight);
    }, [wWidth, wHeight]);

    function incrementIndex() {
        setCurrentAdIndex(
            currentAdIndex >= ads.length - 1 ? 0 : currentAdIndex + 1
        );
    }

    return (
        <div
            ref={ref}
            className={`flex flex-col h-full m-0 p-0 bg-gray-100 items-center w-full justify-center text-black ${
                className || ""
            }`}
        >
            <div className="h-full w-full overflow-hidden">
                {!!ads?.length &&
                Number.isInteger(currentAdIndex) &&
                ads[currentAdIndex] ? (
                    ads[currentAdIndex].type === "video" ? (
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
                        <div className="w-full h-full flex items-center justify-center text-lg font-light">
                            Errore nel caricamento della pubblicit??
                        </div>
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-light">
                        Nessuna pubblicit??
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdBanner;
