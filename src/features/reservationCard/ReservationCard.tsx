import React, { lazy, useEffect, useState } from 'react'

import Button from '../../shared/ui/button'
import { useTheme } from '../../shared/ui/themeContext/ThemeContext'

import styles from './styles.module.scss'
import { IReservation } from '../../api/ReservationService'
import { ITableReservation } from '../tableReservationList/TableReservationList'
import { Modal } from '@mui/material'
import { parseDateTime } from '../../shared/utils'
import ReservationModal from '../../pages/reserveTablePage/ReservationModal'

type Props = {
  data: ITableReservation
  setFilteredReservations: React.Dispatch<React.SetStateAction<ITableReservation[]>>
}
const ReservationCard = ({ data, setFilteredReservations }: Props) => {
  const { theme } = useTheme()
  const rootClassName = theme === 'dark' ? styles.rootDark : styles.rootLight

  const [reservationUserData, setReservationUserData] = useState<IReservation>()
  const [isOpen, setIsOpen] = useState(false)
  const [errorDate, setErrorDate] = useState(false)
  const [errorPhone, setErrorPhone] = useState(false)
  const [errorBook, setErrorBook] = useState(false)

  const handleButton = async () => {
    setIsOpen(true)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleDelete = () => {}

  const handleClose = () => {
    setIsOpen(false)
    setErrorDate(false)
  }

  const barIdParser = (barId: number) => {
    switch (barId) {
      case 1:
        return 'Ровесник'
      case 2:
        return 'Скрепка'
      case 3:
        return 'Дорожка'
    }
  }

  const [isDepositOpen, setIsDepositOpen] = useState(false)

  const handlePay = () => {
    setIsDepositOpen(!isDepositOpen)
    window.open('https://t.me/crm_head_test_bot?start=support', '_blank')
  }

  return (
    <>
      {data && (
        <div className="mb-6">
          <div className={`${styles.root}`} onClick={handleOpen}>
            <h1 className="text-white">{`Бар ${barIdParser(data.table.bar_id)}`}</h1>
            <p className="text-white">{` `}</p>
            <div>
              {data && (
                <>
                  <div className="flex gap-2 bg-white p-1 rounded-md">
                    <p className="font-bold">
                      {parseDateTime(data.reservation.reservation_start)}
                    </p>
                    <p className="font-bold">Стол №{data.table.table_id}</p>
                    <p className="font-bold">{`на ${data.table.capacity} ${data.table.capacity > 4 ? 'мест' : 'места'}`}</p>
                  </div>
                </>
              )}
            </div>
            <div>
              <Button
                type="blue"
                text={'Изменить бронь'}
                onClick={() => handleButton()}
              />
            </div>
          </div>
        </div>
      )}
      <ReservationModal
        tableReservation={data}
        handleClose={handleClose}
        isOpen={isOpen}
        setReservationUserData={setReservationUserData}
        errorDate={errorDate}
        setErrorDate={setErrorDate}
        setErrorPhone={setErrorPhone}
        errorPhone={errorPhone}
        setFilteredReservations={setFilteredReservations}
        errorBook={errorBook}
        setErrorBook={setErrorBook}
      />
      <Modal
        open={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        className="w-4/5 mx-10 flex justify-center items-center"
      >
        <div
          className={`${theme === 'dark' ? 'bg-neutral-900 text-neutral-100 border-blue-500 border' : 'bg-white'} p-6 rounded-2xl`}
        >
          <p className="text-xl mb-4 font-bold">
            Сумма: {data.table.capacity * 1000} руб. <br/>
            Свяжитесь с тех. поддержкой чтобы оплатить депозит
          </p>
          <Button type="blue" text={'Связаться'} onClick={() => handlePay()} />
        </div>
      </Modal>
    </>
  )
}

export default ReservationCard
