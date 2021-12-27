import React, { useEffect, useState } from "react";
import moment from "moment-timezone";

/**
 * @typedef News
 * @prop {string} title
 * @prop {string} [type]
 * @prop {string} [date]
 */

const News = props => {
    /** @type {News[] | null} */
    const news = props.news;

    /** @type {boolean} */
    const newsLoaded = props.newsLoaded;

    /** @type {string | null} */
    const newsReqErr = props.newsReqErr;

    const [animTimeout, setAnimTimeout] = useState(null);

    // to prevent updating the component when news haven't changed
    const jsonNews = JSON.stringify(news);

    useEffect(() => {
        function startAnimation() {
            if (!Array.isArray(news)) return null;
            console.log("News animation start");
            const m = 100 / news.length;
            let keyframes = "@keyframes spin-words {";
            for (let i = 1; i <= news.length; i++) {
                keyframes += `
                    ${(i - 1) * m + m * (1 / 5)}% {
                        transform: translateY(-${i}00%);
                    }`;
                keyframes += `
                    ${i * m}% {
                        transform: translateY(-${i}00%);
                    }`;
            }
            keyframes += "}";
            keyframes += `
                .spin-words {
                    animation: spin-words ${news.length * 6}s infinite;
                }`;

            const style = document.createElement("style");
            style.id = "news-keyframes";
            style.innerHTML = keyframes;
            document.getElementsByTagName("head")[0].appendChild(style);
        }

        if (news) {
            // Reset animation
            if (document.getElementById("news-keyframes") !== null) {
                document.getElementById("news-keyframes").remove();
                setAnimTimeout(clearTimeout(animTimeout));
            }

            if (animTimeout) {
                // timeout animation already going
                return;
            }
            // start timeout animation
            setAnimTimeout(setTimeout(startAnimation, 6000));
        } else {
            // clear timeout
            setAnimTimeout(clearTimeout(animTimeout));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jsonNews]);

    return (
        <div className="w-full max-h-9 overflow-hidden">
            {newsReqErr ? (
                <div>Errore nel caricamento delle news: {newsReqErr}</div>
            ) : news ? (
                [...news, news[0]].map((n, i) => (
                    <div
                        key={i}
                        className="w-full whitespace-nowrap spin-words"
                    >
                        {n.date && (
                            <span className="font-light">
                                {moment.parseZone(n.date).format("DD/MM/YYYY")}{" "}
                                -{" "}
                            </span>
                        )}
                        {n.type && <span>{n.type} - </span>}
                        <span className="font-light">{n.title}</span>
                    </div>
                ))
            ) : (
                !newsLoaded && <div>Caricamento news...</div>
            )}
        </div>
        // <div className="scroll-text whitespace-nowrap">
        // </div>
    );
};

export default News;
