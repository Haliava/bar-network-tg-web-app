import { apiEndpoint } from "../../shared/constants"
import { TTicket, UID } from "../../shared/types"

type TFetchUserTickets = (uid?: UID) => Promise<TTicket[]> 
export const fetchUserTicketsByUID: TFetchUserTickets = (uid = 406149871) => {
    return Promise.resolve([{
        id: 1,
        event_id: 1,
        client_chat_id: 1,
        qr_path: '123',
        activation_status: false,
        friends: null,
        hashcode: '123',
    }])
    return fetch(`${apiEndpoint}/tickets/${uid}`, {
        method: 'GET',
    }).then(res => res.json());
}