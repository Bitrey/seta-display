import React from "react";

const News = ({ news }) => {
    const m = 100 / news.length;
    let keyframes = "@keyframes spin-words {";
    for (let i = 1; i <= news.length; i++) {
        keyframes += `
            ${(i - 1) * m + m * (2 / 5)}% {
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
            animation: spin-words ${news.length * 5}s infinite;
        }`;
    console.log(keyframes);

    const style = document.createElement("style");
    style.innerHTML = keyframes;
    document.getElementsByTagName("head")[0].appendChild(style);

    return (
        <div className="w-full max-h-8 overflow-hidden">
            {[...news, news[0]].map(n => (
                <div className="w-full whitespace-nowrap spin-words">
                    {n.date && <span className="font-light">{n.date} - </span>}
                    {n.type && <span>{n.type} - </span>}
                    {n.title && (
                        <>
                            <span className="font-semibold">{n.title}</span>
                            <span className="font-light"> - </span>
                        </>
                    )}
                    <span className="font-light">{n.description}</span>
                </div>
            ))}
        </div>
        // <div className="scroll-text whitespace-nowrap">
        // </div>
    );
};

export default News;
