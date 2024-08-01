import React, { useState } from 'react'

import { MenuItem, Modal, Select } from '@mui/material'
import { Formik, Form, Field } from 'formik'
import Button from '../../shared/ui/button'
import { useTheme } from '../../shared/ui/themeContext/ThemeContext'
import { dateSelectRange, maxGuestCount } from '../../shared/constants'
import { addDaysToDate } from '../../shared/utils'

import styles from './styles.module.scss'
import { IReservationUserData } from '../../pages/reserveTablePage/ReserverveTablePage'
import TablesService, { ITable } from '../../api/TablesService'

const ReservationForm = ({
  setReservationUserData,
  setAvailableTables,
}: {
  setReservationUserData: React.Dispatch<
    React.SetStateAction<IReservationUserData>
  >
  setAvailableTables: React.Dispatch<React.SetStateAction<ITable[]>>
}) => {
  const date = new Date()
  const getTimeSelectList = (date: Date) => {
    const startHour = 14
    const endHour = 28

    const timeList = []

    for (let hour = startHour; hour <= endHour; hour++) {
      const hourText = hour % 24 < 10 ? `0${hour % 24}` : `${hour % 24}`
      const time = `${hourText}:00`
      timeList.push(time)
    }

    return timeList
  }

  const timeSelectList = getTimeSelectList(date )
  const { theme } = useTheme()

  const fieldNameClass =
    theme === 'dark' ? styles.fieldNameDark : styles.fieldNameLight
  const fieldGuestCountClass =
    theme === 'dark' ? styles.fieldGuestCountDark : styles.fieldGuestCountLight
  const fieldDateClass =
    theme === 'dark' ? styles.fieldDateDark : styles.fieldDateLight
  const fieldTimeClass =
    theme === 'dark' ? styles.fieldTimeDark : styles.fieldTimeLight

  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('1')
  const [buttonText, setButtonText] = useState('1')

  const handleInputSubmit = async (values: any) => {
    if (values.guestCount < 10) {
      const dateWithoutTime = new Date(values.dateSelect)
      const time = values.timeSelect.split(':')
      dateWithoutTime.setHours(parseInt(time[0], 10) + 2)
      dateWithoutTime.setMinutes(parseInt(time[1], 10))
      const formattedDateTime = dateWithoutTime
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')
      console.log(formattedDateTime)
      setReservationUserData((prevState) => ({
        ...prevState,
        date: formattedDateTime,
        capacity: values.guestCount,
      }))
      const res = await TablesService.getAll(
        formattedDateTime,
        values.guestCount,
      )
      if (res.data.Status === 'Failed') {
        setMessage(
          'К сожалению, мы не нашли столы которые соответствуют вашему запросу',
        )
        setButtonText('Изменить параметры')
        setIsOpen(true)
      } else {
        setAvailableTables(res.data.Message)
      }
    } else {
      setMessage(
        'Если вы хотите забронировать стол на 10+ человек, вам нужно связатся с менеджером',
      )
      setButtonText('Связаться')
      setIsOpen(true)
    }
  }

  const handleButton = () => {
    if (buttonText === 'Связаться') {
      window.open('https://t.me/crm_head_test_bot?start=support', '_blank')
    }
    setIsOpen(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }
    return new Intl.DateTimeFormat('ru-RU', options).format(date)
  }
  const addHoursToDate = (hourCount: number): Date => {
    const msInAnHour = 3600000;
    return new Date(Date.now() + msInAnHour * hourCount)
  };


  return (
    <>
      <div className={styles.root}>
        <Formik
          initialValues={{
            guestCount: 2,
            dateSelect: addHoursToDate(3)
              .toISOString()
              .split('T')[0] as string,
            timeSelect: timeSelectList[0],
          }}
          onSubmit={(values) => {
            handleInputSubmit(values)
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Form>
              <div className={styles.formFieldInfo}>
                <Select
                  displayEmpty={true}
                  renderValue={(value) => value || 'Количество гостей'}
                  name="guestCount"
                  className={`${styles.fieldGuestCount} ${fieldGuestCountClass}`}
                  value={values.guestCount}
                  onChange={handleChange}
                >
                  {Array.from({ length: maxGuestCount }).map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className={styles.formFieldDate}>
                <Field
                  name="dateSelect"
                  as={Select}
                  displayEmpty={true}
                  renderValue={(value: any) => formatDate(value) || 'Дата'}
                  className={`${styles.fieldDate} ${fieldDateClass}`}
                >
                  {Array.from({ length: dateSelectRange }).map((_, i) => {
                    const newDateTimestamp = addDaysToDate(date, i)
                      .toISOString()
                      .split('T')[0] as string
                    return (
                      <MenuItem key={i} value={newDateTimestamp}>
                        {formatDate(newDateTimestamp)}
                      </MenuItem>
                    )
                  })}
                </Field>

                <Select
                  displayEmpty={true}
                  renderValue={() => {
                    const currentTime = addHoursToDate(3).toLocaleTimeString('ru-RU', { hour: '2-digit' });
                    return currentTime.replace(/:\d{2} /, ' ') + ':00';
                  }}
                  name="timeSelect"
                  className={`${styles.fieldTime} ${fieldTimeClass}`}
                  value={values.timeSelect}
                  onChange={handleChange}
                >
                  {timeSelectList.map((time, i) => (
                    <MenuItem key={i} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <Button
                type="blue"
                text="Поиск"
                className={styles.btnSubmit}
                onClick={handleSubmit}
              />
            </Form>
          )}
        </Formik>
      </div>

      <Modal
        open={isOpen}
        className="w-4/5 mx-10 flex justify-center items-center"
      >
        <div
          className={`${theme === 'dark' ? 'bg-neutral-900 text-neutral-100 border-blue-500 border' : 'bg-white'} p-6 rounded-2xl`}
        >
          <p
            className={`${theme === 'dark' ? 'text-neutral-100' : 'text-neutral-900'}`}
          >
            {message}
          </p>
          <Button
            text={buttonText}
            onClick={() => handleButton()}
            type="realBlue"
            className={`text-white mt-4`}
          />
        </div>
      </Modal>
    </>
  )
}

export default ReservationForm
