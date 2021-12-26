import React, { Component } from "react";
import Clock from "react-live-clock";
import NewsText from "./NewsText";

const news = [
    {
        title: "Dio non esiste",
        date: "6/9/420",
        type: "Lavori in corso",
        description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iste illum, quo voluptate ratione vitae animi? Non, nulla! Illo enim impedit alias? Repellendus ratione consequatur sunt quibusdam. Deserunt, qui dolores."
    },
    {
        title: "Dasaaase",
        date: "13/13/2013",
        type: "Lavori in corso",
        description:
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minima eligendi consectetur molestiae reprehenderit magni, facere sint repellat eos at facilis cumque ea nisi voluptas pariatur voluptate architecto laborum beatae numquam!"
    },
    {
        title: "asdfasdfsdf",
        date: "14/12/1234",
        type: "Lavori in corso",
        description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, corrupti. Deleniti fugiat adipisci earum excepturi ea iste enim similique dicta labore! Laboriosam illo impedit harum, culpa animi quos nemo nesciunt?"
    },
    {
        title: "Dio non esiste",
        date: "6/9/420",
        type: "jojax gay",
        description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa iste illum, quo voluptate ratione vitae animi? Non, nulla! Illo enim impedit alias? Repellendus ratione consequatur sunt quibusdam. Deserunt, qui dolores."
    }
];

class Topbar extends Component {
    render() {
        // eslint-disable-next-line no-unused-vars
        const { stopId, stopName } = this.props;
        return (
            <>
                <div className="w-full flex flex-row items-center justify-between bg-gray-900 py-3 px-6">
                    <div className="flex items-end">
                        <p className="text-3xl font-semibold">{stopName}</p>
                        <div className="flex ml-3">
                            {/* <p className="font-light mr-2">Codice fermata</p> */}
                            <p className="font-light">
                                {Array.isArray(stopId)
                                    ? stopId.join(", ")
                                    : stopId}
                            </p>
                        </div>
                    </div>
                    <p className="font-light text-right">
                        <Clock
                            format={"DD/MM/YYYY HH:mm:ss"}
                            ticking={true}
                            timezone={"Europe/Rome"}
                        />
                        {/* {time || "Caricamento..."} */}
                    </p>
                </div>
                <div className="w-full flex flex-col bg-gray-700 pt-4 pb-5 px-6 overflow-hidden">
                    <NewsText news={news} />
                </div>
            </>
        );
    }
}

export default Topbar;
