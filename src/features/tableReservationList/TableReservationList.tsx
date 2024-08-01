import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../../shared/ui/button'
import ReservationCard from '../reservationCard'

import styles from './styles.module.scss'
import { TableData } from '../../shared/types'
import ReservationService, { IReservation } from '../../api/ReservationService'
import TablesService, { ITable } from '../../api/TablesService'
import { selectUID } from '../../entities/user/userSlice'
import { useAppSelector } from '../../app/hooks/redux'

export interface ITableReservation {
  reservation: IReservation
  table: ITable
}

const TableReservationList = () => {
  const navigate = useNavigate()
  const [filteredReservations, setFilteredReservations] =
    React.useState<ITableReservation[]>()
  const client_chat_id = Telegram.WebApp.initDataUnsafe.user?.id ?? 1713121214;

  useEffect(() => {
    (async () => {
      const res = await ReservationService.getAll(client_chat_id!)
      const groupedReservationTable: ITableReservation[] = []
      if (res.data.Status !== 'Failed') {
        for (const reservation of res.data.Message) {
          const tableRes = await TablesService.getByUuid(reservation.table_uuid)
          groupedReservationTable.push({
            reservation,
            table: tableRes.data.Message,
          })
        }

        const mergedReservations: ITableReservation[] = []
        const orderUuidMap = new Map<string, ITableReservation>()

        for (const item of groupedReservationTable) {
          const { order_uuid } = item.reservation
          if (!orderUuidMap.has(order_uuid!)) {
            orderUuidMap.set(order_uuid!, item)
            mergedReservations.push(item)
          } else {
            const existingItem = orderUuidMap.get(order_uuid!)
            existingItem!.table.capacity += item.table.capacity
          }
        }
        console.log(mergedReservations, "<------")
        setFilteredReservations(mergedReservations)
      }
    })()
  }, [])

  const handleReservation = ({}: {
    onTableSelect: (table: TableData) => void
  }) => navigate('/reservation?barId=1')

  useEffect(() => {
    console.log(filteredReservations, "<=-=------=-==-=")
  }, [filteredReservations])

  return (
    <div>
      {filteredReservations && filteredReservations.length > 0 ? (
        filteredReservations.map((reservation, i) => (
          <ReservationCard key={i} data={reservation} setFilteredReservations={setFilteredReservations}/>
        ))
      ) : (
        <div className={styles.noReserveTable}>
          <p>
            {
              'Вы пока что не бронировали стол в нашем заведении, но можете сделать это прямо сейчас.'
            }
          </p>
          <Button
            type="blue"
            text={'Забронировать стол'}
            onClick={handleReservation}
          />
        </div>
      )}
    </div>
  )
}

export default TableReservationList
