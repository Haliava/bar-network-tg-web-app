import {apiEndpoint, mockApiResponse} from "../../shared/constants";
import {ApiResponse, BarId, EventId, TEvent} from "../../shared/types";

export type TFetchEvents = (barId?: BarId) => Promise<ApiResponse>;
export const fetchEvents: TFetchEvents = async (barId = 1) => {
    return Promise.resolve(mockApiResponse)
    return fetch(`${apiEndpoint}/${barId}/events`, {
        method: 'GET',
    }).then(res => res.json());
}

export type TFetchEventDataById = (eventId?: EventId | string) => Promise<TEvent>;
export const fetchEventDataById: TFetchEventDataById = async (eventId) => {
    return fetch(`${apiEndpoint}/event/${eventId}`, {
        method: 'GET',
    }).then(res => res.json());
}

type TUploadImage = (path: string) => Promise<any>;
export const uploadImage: TUploadImage = (path) => {
    return fetch(`${apiEndpoint}/download_file/?path_to_file=${path}`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET',
    }).then(res => res.blob());
}