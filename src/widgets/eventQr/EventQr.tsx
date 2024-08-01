import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '../../app/hooks/redux';
import Spinner from '../../compoments/Spinner';
import { barAddressMap, barDisplayNameList, barQrTextMap } from '../../shared/constants';
import { convertTimestampToDateString, splitDatetimeString } from '../../shared/utils';
import { EventId } from '../../shared/types';
import { fetchQrImg } from '../../entities/ticket/api';
import { selectEventById } from '../../entities/event/eventSlice';
import { selectTicketByEventId } from '../../entities/user/userSlice';
import { useTheme } from '../../shared/ui/themeContext/ThemeContext';
import styles from './styles.module.scss';

type Props = {
    eventId: EventId,
    isModalOpen: boolean,
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    className?: string,
}
const EventQr = ({ eventId, isModalOpen, setIsModalOpen, className }: Props) => {
    if (!isModalOpen) return;

    const { activation_status, qr_path } = useAppSelector((state) => selectTicketByEventId(state, eventId));
    const { short_name, dateandtime, bar_id } = useAppSelector((state) => selectEventById(state, eventId));
    const [date, time] = splitDatetimeString(dateandtime);
    const readableDate = convertTimestampToDateString(date);
    const [copyAddressState, setCopyAddressState] = useState(true);

    const { data: qrImg, isLoading } = useQuery({
        queryKey: ['getQrImg'],
        queryFn: () => fetchQrImg(qr_path)
    });

    useEffect(() => {
        if (copyAddressState) return;

        navigator.clipboard.writeText(
            barDisplayNameList[bar_id - 1] + '\n' +
            readableDate + '\n' +
            barAddressMap.get(barDisplayNameList[bar_id - 1])
        );
        const timeout = setTimeout(() => setCopyAddressState(true), 1000);

        return () => clearTimeout(timeout);
    }, [copyAddressState])

    const { theme } = useTheme();
    const themeModalContainer = theme === 'dark' ? styles.darkThemeModal : styles.lightThemeModal;
    const themeContent = theme === 'dark' ? styles.darkTheme : styles.lightTheme;

    return (
        <Modal
            className={classNames(`${styles.modalContainer} ${themeModalContainer}`, className)}
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
        >
            <div className={`${styles.content} ${themeContent}`}>
                {isLoading && <Spinner />}
                {!isLoading && (
                    <img src={URL.createObjectURL(qrImg)} alt='qr' />                    
                )}
                <div className={styles.status}>
                    <div className={activation_status ? styles.statusActive : styles.statusCompleted}>
                        {activation_status ? 'активен' : 'не активен'}
                    </div>
                    <div
                        className={copyAddressState ? styles.statusActive : styles.statusCompleted}
                        onClick={() => setCopyAddressState(prev => !prev)}
                    >
                        {copyAddressState ? 'скопировать адрес' : 'скопировано!'}
                    </div>
                </div>
                <p className={styles.shortName}>{short_name}</p>
                <div className={styles.dateTime}>
                    <p>Дата: {readableDate}</p>
                    <p>Время: {time}</p>
                </div>
                <div className={styles.barInfo}>
                    <p>{barQrTextMap.get(barDisplayNameList[bar_id - 1])}</p>
                    <p><span>{barAddressMap.get(barDisplayNameList[bar_id - 1])}</span></p>
                </div>
            </div>
        </Modal>
    )
};

export default EventQr;
