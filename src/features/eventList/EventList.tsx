import React from 'react';
import { useAppSelector } from '../../app/hooks/redux';
import { selectBarFilter, selectEvents, selectEventsByBarId } from '../../entities/event/eventSlice';
import EventCard from '../../widgets/eventCard';
import styles from './styles.module.scss';
import { splitDatetimeString } from '../../shared/utils';
import dayjs from 'dayjs';
import { fetchUserTicketsByUID } from '../../entities/user/api';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useGetBarData from '../../app/hooks/useGetBarData';

const EventList = () => {
    const [searchParams] = useSearchParams();
    const [barId] = useGetBarData(searchParams);
    const events = useAppSelector((state) => selectBarFilter(state) === 0 ? selectEvents(state) : selectEventsByBarId(state, barId));
    const uid = (searchParams.get('uid') || Telegram.WebApp.initDataUnsafe.user?.id) ?? undefined;
    const {data: userTickets, isLoading} = useQuery({
        queryKey: ['getUserTickets', uid],
        queryFn: () => fetchUserTicketsByUID(uid)
    })
    console.log(events)

    return (
        <div>
            {!isLoading && events.length > 0 && (
                events.filter(event => {
                    const eventDate = dayjs(splitDatetimeString(event.dateandtime)[0]);
                    const now = dayjs();

                    // показывает только ивенты, которые ещё не прошли
                    // return now.diff(eventDate, 'day', true) < 1;
                    return true;
                }).map((event) => {
                    const additionalProps = event.event_type === 'free' ? {
                        customActionButtonText: 
                            (userTickets ?? []).filter(ticket => ticket.event_id === event.event_id).length > 0 ?
                            'Вы зарегистрированы': 'Зарегистрироваться'
                    }: {
                        customActionButtonText: 
                            (userTickets ?? []).filter(ticket => ticket.event_id === event.event_id).length > 0 ?
                            'Билет куплен': 'Купить билет'
                    };

                    return (
                        <div key={event.event_id} className={styles.container}>
                            <EventCard
                                key={event.event_id}
                                data={event}
                                showUpperBubble
                                showActionButton
                                cardType='base'
                                {...additionalProps}
                            />
                        </div>
                    )
                })
            )}                
        </div>
    );
};

export default EventList;