import React, { Component } from "react";
import axios from "axios";

class Topbar extends Component {
    state = {
        stopName: null,
        time: null,
        err: null
    };

    async componentDidMount() {
        try {
            console.log(this.props);
            const res = await axios.post("/api/time", {
                agency: this.props.agency
            });
            this.setState({ time: res.data.time });
        } catch (err) {
            if (err?.response?.data?.err) {
                this.setState({ err: err.response.data.err });
                console.log(this.state.err);
            } else {
                this.setState({ err: "Unknown error" });
                console.error(err);
            }
        }
    }

    render() {
        return (
            <div
                className={
                    "text-yellow-200 w-full p-4 " + (this.props.className || "")
                }
            >
                <div className="flex justify-between">
                    <div className="flex flex-col">
                        <p className="text-xl">Ti trovi alla fermata</p>
                        <p className="text-5xl">San Cesario</p>
                    </div>
                    <div className="flex flex-col text-right">
                        <p className="text-xl">27/10/2021</p>
                        <p className="text-5xl">{this.state.time || "XX:XX"}</p>
                    </div>
                </div>
            </div>
        );
    }
}

export default Topbar;
