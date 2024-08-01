import { Modal, Select, MenuItem } from '@mui/material'
import { Field, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'

import { closeCross } from '../../shared/assets'
import { dateSelectRange, maxGuestCount } from '../../shared/constants'
import Button from '../../shared/ui/button'
import {
  addDaysToDate,
  getTimeSelectList,
  convertTimestampToDateString,
} from '../../shared/utils'

import styles from './styles.module.scss'

import { useTheme } from '../../shared/ui/themeContext/ThemeContext'
import ReservationService, { IReservation } from '../../api/ReservationService'
import TablesService, { ITable } from '../../api/TablesService'
import axios from 'axios'
import { ITableReservation } from '../../features/tableReservationList/TableReservationList'

const ReservationModal = ({
  isOpen,
  handleClose,
  tableReservation,
  errorDate,
  setErrorDate,
    setErrorPhone,
    errorPhone,
    setFilteredReservations,
    errorBook,
    setErrorBook,
}: {
  isOpen: boolean
  handleClose: () => void
  setReservationUserData: React.Dispatch<React.SetStateAction<any>>
  tableReservation: ITableReservation
  errorDate: boolean
  setErrorDate: React.Dispatch<React.SetStateAction<boolean>>
  setErrorPhone: React.Dispatch<React.SetStateAction<boolean>>
  errorPhone: boolean
  setFilteredReservations: React.Dispatch<React.SetStateAction<ITableReservation[]>>
  errorBook: boolean
  setErrorBook: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const date = new Date()
  const timeSelectList = getTimeSelectList(date)

  const { theme } = useTheme()

  const handleInputSubmit = async (values: any) => {
    const dateWithoutTime = new Date(values.dateSelect);
    const [hours, minutes] = values.timeSelect.split(':');
    const clientPhoneRes = await axios.patch(
        'https://rovesnik-bot.ru/api/client/update_phone',
        {
          chat_id: tableReservation.reservation.client_chat_id,
          phone: values.phone,
        }
    )
    if (clientPhoneRes.data.Status === 'Failed') {
      setErrorPhone(true)
      return
    }
    try {
      console.log(values)
      const dateWithoutTime = new Date(values.dateSelect)
      const formattedDateTime = dateWithoutTime.toISOString().slice(0, 19).replace('T', ' ');
      const newTableData: ITable = {
        bar_id: receivedTable!.bar_id!,
        storey: receivedTable!.storey!,
        table_id: receivedTable!.table_id!,
        table_uuid: receivedTable!.table_uuid!,
        capacity: receivedTable!.capacity!,
        is_available: true,
        terminal_group_uuid: receivedTable!.terminal_group_uuid!,
      }
      const uuidRes = await ReservationService.uuid(
        tableReservation.reservation.order_uuid!,
      )
      const promises = uuidRes.data.Message.map(async (uuid: IReservation) => {
        return ReservationService.update({
          reserve_id: uuid.reserve_id,
          reservation_start: formattedDateTime + '.000',
          table_uuid: uuid.table_uuid,
          client_chat_id: uuid.client_chat_id
        })
      })
      const resRes = await Promise.all(promises)

      const failedResponse = resRes.find((res) => res.data.Status === 'Failed');

      if (failedResponse) {
        (failedResponse.data.Message.includes('rebook') ? setErrorBook(true) : setErrorDate(true));
      } else {
        handleClose();
      }



      const tableRes = await TablesService.update(newTableData)
      const clientFirstNameRes = await axios.patch(
        'https://rovesnik-bot.ru/api/client/update_first_name',
        {
          chat_id: tableReservation.reservation.client_chat_id,
          first_name: values.name.split(' ')[0],
        },
      )
      const clientLastNameRes = await axios.patch(
        'https://rovesnik-bot.ru/api/client/update_last_name',
        {
          chat_id: tableReservation.reservation.client_chat_id,
          last_name: values.name.split(' ')[1],
        }
      )

      console.log(clientFirstNameRes)
      console.log(tableRes)
      console.log(resRes)
    } catch (e) {
      console.log(e)
    }
  }

  const [receivedTable, setReceivedTable] = useState<ITable>()
  const [receivedClient, setReceivedClient] = useState<any>()

  useEffect(() => {
    (async () => {
      const tableRes = await TablesService.getByUuid(
        tableReservation.reservation.table_uuid,
      )
      const clientRes = await axios.get(
        'https://rovesnik-bot.ru/api/client/' +
          tableReservation.reservation.client_chat_id,
      )
      setReceivedTable(tableRes.data.Message)
      setReceivedClient(clientRes.data)
      console.log(tableRes)
    })()
  }, [])

  const handleCancleReservation = async () => {
    try {
      await ReservationService.cancel(tableReservation.reservation.reserve_id)
      setFilteredReservations(prevState => prevState.filter((item) => item.reservation.reserve_id !== tableReservation.reservation.reserve_id))
    } catch (e) {
      console.log(e)
    } finally {
      handleClose()
      setErrorDate(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      className="w-4/5 mx-10 flex justify-center items-center"
    >
      <div
        className={`${theme === 'dark' ? 'bg-neutral-900 text-neutral-100 border-blue-500 border' : 'bg-white'} p-6 rounded-2xl`}
      >
        <Formik
            initialValues={{
              dateSelect:
                  tableReservation.reservation.reservation_start.split('T')[0],
              timeSelect: tableReservation.reservation.reservation_start
                  .split('T')[1]
                  .slice(0, 5),
              name: receivedClient?.first_name + ' ' + receivedClient?.last_name,
              phone: receivedClient?.phone,
            }}
            onSubmit={(values) => {
              handleInputSubmit(values)
            }}
        >
        {({ handleSubmit, handleChange, values }) => (
            <Form>
              <button onClick={handleClose}>
                <img
                  className={styles.closeCrossButton1}
                  src={closeCross}
                  alt="closeBtn"
                />
              </button>
              <h1 className="font-bold text-xl">Бронь стола №{tableReservation.table.table_id}</h1>
              <div
                className={`mt-2`}
                style={{ display: 'flex', marginBottom: '10px' }}
              >
                <Field
                  name="name"
                  placeholder="Имя Фамилия"
                  className={`rounded-md ${theme === 'dark' ? 'bg-neutral-700 text-neutral-100' : 'bg-white'} ${styles.fieldName}`}
                  style={{
                    width: '100%',
                    border: '1px solid gray',
                    textColor: 'black',
                  }}
                />
              </div>
              <div
                className={'mt-2'}
                style={{ display: 'flex', marginBottom: '10px' }}
              >
                <Field
                  name="phone"
                  placeholder="Номер телефона"
                  type="tel"
                  className={`rounded-md ${theme === 'dark' ? 'bg-neutral-700 text-neutral-100' : 'bg-white'} ${styles.fieldName}`}
                  style={{ width: '100%', border: '1px solid gray' }}
                />
                {
                  errorPhone && <p className={'text-red-500'}>Неверный формат номера телефона. Пример: +79999999999 </p>
                }
              </div>
              <div
                className={styles.inputRow}
                style={{ display: 'flex', marginBottom: '10px' }}
              >
                <Field
                  name="dateSelect"
                  as={Select}
                  displayEmpty={true}
                  label="Дата"
                  className={`rounded-md ${theme === 'dark' ? 'bg-neutral-400 text-neutral-100' : 'bg-white'}`}
                  style={{ width: '50%', marginRight: '5px' }}
                >
                  {Array.from({ length: dateSelectRange }).map((_, i) => {
                    const newDateTimestamp = addDaysToDate(date, i)
                      .toISOString()
                      .split('T')[0] as string
                    return (
                      <MenuItem key={i} value={newDateTimestamp}>
                        {convertTimestampToDateString(newDateTimestamp)}
                      </MenuItem>
                    )
                  })}
                </Field>
                <Select
                    displayEmpty={true}
                    renderValue={(value) => value || 'Время'}
                    name="timeSelect"
                    label="Время"
                    className={`rounded-md ${theme === 'dark' ? 'bg-neutral-400 text-neutral-100' : 'bg-white'}`}
                    style={{ width: '50%', marginLeft: '5px' }}
                    value={values.timeSelect}
                    onChange={ handleChange }
                >
                  {timeSelectList.map((time, i) => (
                      <MenuItem key={i} value={time}>
                        {time}
                      </MenuItem>
                  ))}
                </Select>

              </div>
              <div
                className={styles.inputRow}
                style={{ display: 'flex', marginBottom: '10px' }}
              >
                {/*<p className='font-bold p-2'>Бронь на {tableReservation.table.capacity} {tableReservation.table.capacity === 3 || tableReservation.table.capacity ===4 ? 'человека' : 'человек'}</p>*/}
              </div>
              {errorDate && (
                <p
                  className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                >
                  Невозможно забронировать стол на данное время, выберите другое
                </p>
              )}
              {errorBook && (
                  <p
                      className={`${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                  >
                    Вы уже меняли бронирование сегодня
                  </p>
              )}
              <div className={'mt-10'} style={{ marginTop: '16px' }}>
                <Button
                  type="realBlue"
                  text="Сохранить"
                  onClick={handleSubmit}
                  style={{ width: '100%' }}
                  className="text-white"
                />
                <button
                  onClick={handleCancleReservation}
                  className={'mt-4 w-full bg-red-500 px-4 py-2 rounded-full text-white'}
                >
                  Удалить бронь
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  )
}

export default ReservationModal
