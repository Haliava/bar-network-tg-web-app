import { AxiosResponse } from 'axios'
import $api from './index'

interface IRes {
  Status: string
  Message: IReservation[]
}

export interface IReservation {
  client_chat_id: number
  table_uuid: string
  reserve_id: string
  reservation_start: string
  status?: string
  deposit: number
  order_uuid?: string
}

export default class ReservationService {
  static async getAll(chatId: number): Promise<AxiosResponse<IRes>> {
    return $api.get(`/reservation/get_all_reserved_statuses_by_chat_id/${chatId}`)
  }

  static async create(data: {
    client_chat_id: number
    table_uuid: string
    reservation_start: string
    deposit: number
  }): Promise<AxiosResponse> {
    return $api.post('/reservation/create', { ...data })
  }

  static async cancel(reserve_id: string): Promise<AxiosResponse> {
    return $api.post('/reservation/cancel', {
      reserve_id,
      cancel_reason: 'Other',
    })
  }

  static async update(data: {
    reserve_id: string
    reservation_start: string
  }): Promise<AxiosResponse> {
    return $api.post('/reservation/update', { ...data })
  }

  static async uuid(
    order_uuid: string,
  ): Promise<AxiosResponse<IReservation[]>> {
    return $api.get(`/reservation/get_by_order_uuid/${order_uuid}`)
  }
}
