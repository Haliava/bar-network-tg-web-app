import { Modal } from '@mui/material'
import React, { Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import Spinner from '../../compoments/Spinner'
import ReservationForm from '../../features/reservationForm'
const TableList = React.lazy(() => import('../../features/tableList'))
import {
  arrowLeftLight,
  arrowLeftDark,
  arrowRightLight,
  arrowRightDark,
  closeCross,
} from '../../shared/assets'
import {
  reservationsApiMockResponse,
} from '../../shared/constants'
import type { ReservationInfo } from '../../shared/types'
import Button from '../../shared/ui/button'
import Footer from '../../shared/ui/footer'
import Header from '../../shared/ui/header'
import { useTheme } from '../../shared/ui/themeContext/ThemeContext'
import { convertTimestampToDateString } from '../../shared/utils'

import styles from './styles.module.scss'
import { Field, Form, Formik } from 'formik'
import axios from 'axios'
import ReservationService from '../../api/ReservationService'
import { ITable } from '../../api/TablesService'

export interface IReservationUserData {
  name: string
  phone: string
  guestsCount: number
  date: string
}

const ReserveTablePage = () => {
  const client_chat_id = window.Telegram.WebApp.initDataUnsafe?.user?.id ?? 1713121214
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const selectedReservationDate: ReservationInfo =
      reservationsApiMockResponse[1] // useSelector(selectCurrentReservationDate(selectedTable.id))

  const [selectedTable, setSelectedTable] = useState<ITable | null>(null)
  const [availableTables, setAvailableTables] = useState<ITable[]>([])
  const [receivedClient, setReceivedClient] = useState<any>()
  const [reservationUserData, setReservationUserData] =
      useState<IReservationUserData>({
        name: '',
        phone: '',
        guestsCount: 2,
        date: '',
      })

  useEffect(() => {
    ;(async () => {
      const clientRes = await axios.get(
          'https://rovesnik-bot.ru/api/client/' + client_chat_id,
      )
      setReceivedClient(clientRes.data)
      setReservationUserData((prevState) => ({
        ...prevState,
        name: clientRes.data.first_name + ' ' + clientRes.data.last_name,
        phone: clientRes.data.phone,
      }))
    })()
  }, [])

  const handleTableSelection = (table: ITable) => {
    setSelectedTable(table)
  }

  const reserveTable = async (values: any) => {
    console.log(reservationUserData)
    if (!selectedTable) return alert('Выберите стол')
    if (!selectedReservationDate) return alert('Выберите дату')
    try {
      const dataToSend = {
        client_chat_id: client_chat_id,
        table_uuid: selectedTable.table_uuid,
        reservation_start: reservationUserData.date + '.000',
        deposit: 0,
        order_uuid: uuidv4().toString(),
      }
      const res = await ReservationService.create(dataToSend)
      console.log(res)
      const [firstName, ...lastNameParts] = values.name.split(' ')
      const lastName = lastNameParts.join(' ')

      const clientFirstRes = await axios.patch(
          'https://rovesnik-bot.ru/api/client/update_first_name',
          {
            chat_id: client_chat_id,
            first_name: firstName,
          },
      )
      const clientLastNameRes = await axios.patch(
          'https://rovesnik-bot.ru/api/client/update_last_name',
          {
            chat_id: client_chat_id,
            last_name: lastName,
          },
      )

      const clientPhoneRes = await axios.patch(
          'https://rovesnik-bot.ru/api/client/update_phone', {
            chat_id: client_chat_id,
            phone: values.phone,
          }
      )

      console.log(clientFirstRes)
      console.log(clientLastNameRes)
      console.log(clientPhoneRes)
      navigate('/my/reservations?barId=1')
    } catch (e) {
      console.log(e)
    }
  }
  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    if (currentStep === 2) navigate('/my/reservations?barId=1')
  }

  const { theme } = useTheme()
  const rootClassName = theme === 'dark' ? styles.darkRoot : styles.lightRoot
  const mainClassName1 = theme === 'dark' ? styles.darkMain : styles.lightMain
  const arrowLeftTheme = theme === 'dark' ? arrowLeftDark : arrowLeftLight
  const arrowRightTheme = theme === 'dark' ? arrowRightDark : arrowRightLight
  const modalContentTheme =
      theme === 'dark' ? styles.modalContentDark : styles.modalContentLight
  const floorImages = ['/floor1.png', '/floor2.png', '/floor3.png']

  const handleInputSubmit = (values: any) => {
    setReservationUserData((prevState) => ({
      ...prevState,
      name: values.name,
      phone: values.phone,
    }))
  }

  const findAvailableFloor = (availableTables: ITable[]) => {
    for (let i = 1; i <= 3; i++) {
      const tablesOnFloor = availableTables.filter(table => table.storey === i);
      if (tablesOnFloor.length > 0) {
        return i;
      }
    }
    return null;
  }

  useEffect(() => {
    const floor = findAvailableFloor(availableTables);
    if (floor !== null) {
      setSelectedFloor(floor);
    }
  }, [availableTables]);

  const formatDate = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
  }

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const options = { hour: 'numeric', minute: 'numeric' };
    return date.toLocaleTimeString('ru-RU', options);
  }


  return (
      <Suspense fallback={<Spinner />}>
        <div className={`${styles.root} ${rootClassName}`}>
          <Header type="reservations" />
          <div className={`${styles.main} ${mainClassName1}`}>
            <h1>{'Забронировать стол'}</h1>
            {/*<p>*/}
            {/*  {*/}
            {/*    'Обратите внимание! Если вы хотите забронировать стол на 2+ часа, тогда свяжитесь с нашим менеджером.'*/}
            {/*  }*/}
            {/*</p>*/}
            <ReservationForm
                setReservationUserData={setReservationUserData}
                setAvailableTables={setAvailableTables}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className={styles.arrowsBtn}>
                <div
                    onClick={() =>
                        setSelectedFloor((prev) => Math.max(prev - 1, 1))
                    }
                >
                  <img
                      className={styles.arrowLeft}
                      src={arrowLeftTheme}
                      alt="arrow-left"
                      width={24}
                      height={24}
                  />
                </div>
                <p>{selectedFloor} Этаж</p>
                <div
                    onClick={() =>
                        setSelectedFloor((prev) => Math.min(prev + 1, 3))
                    }
                >
                  <img
                      className={styles.arrowRight}
                      src={arrowRightTheme}
                      alt="arrow-right"
                      width={24}
                      height={24}
                  />
                </div>
              </div>
              <img src={floorImages[selectedFloor - 1]} alt="Bar Floor" />
              {availableTables.length > 0 && availableTables ? (
                      availableTables.filter(table => table.storey === selectedFloor).length > 0 &&
                      <TableList
                          onTableSelect={handleTableSelection}
                          tables={availableTables.filter(table => table.storey === selectedFloor)}
                          selectedFloor={selectedFloor}
                      />
              ) : (
                  <p className={'text-center font-bold text-xl mb-10'}>
                    Выберите время, количество гостей и нажмите поиск
                  </p>
              )}
            </div>
            {availableTables.find((table) => table.storey === selectedFloor) ? (
                <Button
                    className={`${styles.submitReserve} mb-10`}
                    type="blue"
                    text={'Забронировать стол'}
                    onClick={handleOpen}
                />
            ) : <p>Нет свободных столов на данном этаже</p>}
            <Modal
                open={isOpen}
                onClose={handleClose}
                className="w-4/5 mx-10 flex justify-center items-center"
            >
              <div
                  className={`${theme === 'dark' ? 'bg-neutral-900 text-neutral-100 border-blue-500 border' : 'bg-white'} p-6 rounded-2xl flex flex-col justify-center items-center`}
              >
                {currentStep === 1 && (
                    <div>
                      <button onClick={handleClose}>
                        <img
                            className={styles.closeCrossButton1}
                            src={closeCross}
                            alt="closeBtn"
                        />
                      </button>
                      <h1 className="font-bold text-xl my-2">Бронь стола</h1>
                      <Formik
                          initialValues={{
                            name:
                                receivedClient
                                    ? `${receivedClient?.first_name} ${receivedClient?.last_name}`
                                    : '',
                            phone: receivedClient?.phone,
                          }}
                          onSubmit={(values) => {
                            handleInputSubmit(values) // Обновление состояния reservationUserData
                            reserveTable(values) // Вызов функции reserveTable с передачей значений из формы
                          }}
                      >
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                              {' '}
                              <div className={styles.formFieldInfo}>
                                <Field
                                    name="name"
                                    placeholder="Имя Фамилия"
                                    className={`rounded-md ${theme === 'dark' ? 'bg-neutral-700 text-neutral-100' : 'bg-white'} ${styles.fieldName}`}
                                    style={{ border: '1px solid gray' }}
                                />
                                <Field
                                    name="phone"
                                    placeholder="Номер телефона"
                                    className={`rounded-md ${theme === 'dark' ? 'bg-neutral-700 text-neutral-100' : 'bg-white'} ${styles.fieldName}`}
                                    style={{
                                      border: '1px solid gray',
                                      marginTop: '10px',
                                      marginBottom: '10px',
                                    }}
                                />
                              </div>
                              <p
                                  className={'mt-2 font-semibold'}
                              >{`Количество человек: ${selectedTable?.capacity}`}</p>
                              <p
                                  className={'mt-1'}
                              >{`Стол №${selectedTable?.table_id}`}</p>
                              <p
                                  className={'mt-1'}
                              >{`Дата: ${formatDate(reservationUserData.date)}`}</p>
                              <p
                                  className={'mt-1 mb-4'}
                              >{`Время: ${formatTime(reservationUserData.date)}`}</p>
                              <div className={styles.buttons}>
                                <Button
                                    type="realBlue"
                                    text="Забронировать стол"
                                    className={'text-white'}
                                    onClick={handleSubmit}
                                />
                              </div>
                            </Form>
                        )}
                      </Formik>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className={`${styles.modalContent} ${modalContentTheme}`}>
                      <button onClick={handleClose}>
                        <img src={closeCross} alt="closeBtn" />
                      </button>
                      <h1>Спасибо!</h1>
                      <p>{`Стол забронирован для Вас на ${convertTimestampToDateString(selectedReservationDate.date)} в ${selectedReservationDate.time}. Ждём в нашем заведении!`}</p>
                    </div>
                )}
              </div>
            </Modal>
          </div>
          <Footer />
        </div>
      </Suspense>
  )
}

export default ReserveTablePage
