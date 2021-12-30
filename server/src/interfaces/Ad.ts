import moment from "moment";

export interface Ad {
    agency: string;
    url: string;
    date: moment.Moment;
}
