import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks/redux";
import EventCard from "../../widgets/eventCard";
import Button from "../../shared/ui/button";
import { defaultGuestListNumber, eventTypeDescriptionsMap, shortEventTypeToWordsMap, ticketPurchaseStatusAnswerMap } from "../../shared/constants";
import GuestList from "../../widgets/guestList";
import styles from './styles.module.scss';
import { FormValidationContext } from "../../app/context";
import { useQuery } from "@tanstack/react-query";
import { fetchEventDataById } from "../../entities/event/api";
import { fetchTicketById, purchaseFreeTickets, purchaseTicket, updateTicket } from "../../entities/ticket/api";
import { selectTicketByEventId, selectUID } from "../../entities/user/userSlice";
import { EventTypeShort, GuestInviteForm, TInitPaymentResponse } from "../../shared/types";
import { Modal } from "@mui/material";
import { useTheme } from "../../shared/ui/themeContext/ThemeContext";
import Spinner from "../../compoments/Spinner";
import { getArtistsByEventId } from "../../entities/artist/api";
import Lineup from "../../features/lineup";
import { selectEventById } from "../../entities/event/eventSlice";
import { fetchUserTicketsByUID } from "../../entities/user/api";
import { selectCurrentBarId } from "../../entities/bar/barSlice";
import useGetBarData from "../../app/hooks/useGetBarData";

type Props = {
    eventId: number,
    ticketId?: number,
    pageType?: 'userPage' | 'default',
    purchaseType: string,
    setPurchaseType: React.Dispatch<React.SetStateAction<string>>
}
const EventDetailsPage = ({ eventId, ticketId, pageType = 'default', purchaseType, setPurchaseType }: Props) => {
    //if (Telegram.WebApp.platform === 'unknown') return;

    const [userFirstName, userLastName, username] = [
        Telegram.WebApp.initDataUnsafe.user?.first_name,
        Telegram.WebApp.initDataUnsafe.user?.last_name,
        Telegram.WebApp.initDataUnsafe.user?.username,
    ];
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [barId] = useGetBarData(searchParams);
    const ticketFriendsData = useAppSelector((state) => selectTicketByEventId(state, eventId))?.friends || null;
    const eventData = useAppSelector((state) => selectEventById(state, eventId));
    const eventType = eventData.event_type;
    const userId = Telegram.WebApp.initDataUnsafe.user?.id ?? useAppSelector(selectUID);
    const [guestList, setGuestList] = useState<GuestInviteForm[]>(
        ticketFriendsData ? ticketFriendsData :
            Array.from({ length: defaultGuestListNumber }, (_, k) => k === 0 ?
                { 
                    name: (userFirstName && userLastName && userFirstName + userLastName) ||
                        'Ваше имя',
                    username: username ?? 'Ваш тг',
                } : { name: '', username: ''}
            )
    );
    const [isValid, setIsValid] = useState(false);
    const [showErrorLabel, setShowErrorLabel] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shouldBuyWithBonuses, setShouldBuyWithBonuses] = useState(false);
    const [purchaseResetter, setPurchaseResetter] = useState(false);
    const { data, isLoading } = useQuery({
        queryKey: ['fetchEvent', eventId],
        queryFn: () => ticketId === undefined ? fetchEventDataById(eventId!) : fetchTicketById(ticketId),
    });
    const { data: artistData, isLoading: isArtistLoading } = useQuery({
        queryKey: ['getArtists'],
        queryFn: () => getArtistsByEventId(eventId),
    })
    const { data: ticketStatusData, isLoading: isStatusLoading, refetch } = useQuery({
        refetchOnWindowFocus: false,
        queryKey: ['ticketStatus', eventId, eventType],
        queryFn: () => {
            if (eventType === 'free') return pageType === 'userPage' ?
                updateTicket(eventId, userId, guestList) : purchaseFreeTickets(eventId, userId, guestList);
            else if (eventType === 'deposit') return purchaseTicket(userId, shouldBuyWithBonuses, eventData);
            else return purchaseTicket(userId, shouldBuyWithBonuses, eventData);
        },
        enabled: false,
    });
    const {data: isAlreadyPurchased, isLoading: alreadyPurchasedLoading} = useQuery({
        queryKey: ['checkIfUserHasTicketForThisEvent'],
        queryFn: async () => {
            const userTickets = await fetchUserTicketsByUID(userId);
            return userTickets.filter(ticket => ticket.event_id === eventId).length > 0;
        }
    })

    useEffect(() => {
        if (!isStatusLoading && ticketStatusData && eventType !== 'free' && !shouldBuyWithBonuses && ticketStatusData.PaymentURL) {
            window.location = ticketStatusData.PaymentURL as Location & string;
        }
    }, [isStatusLoading, ticketStatusData]);

    useEffect(() => {
        if (!isLoading && purchaseType !== '') buyTickets(eventType);
    }, [shouldBuyWithBonuses, purchaseResetter])

    const buyTickets = (eventType: EventTypeShort = 'free') => {
        if (!isValid && eventType === 'free') return;

        switch (eventType) {
            case 'free':
                if (isValid) {
                    setShowErrorLabel(false);
                    refetch();
                } else if (!showErrorLabel) setShowErrorLabel(true);
                break;
            case 'event':
            case 'deposit':
                refetch();
                break;
            default:
                break;
        }
        setIsModalOpen(true);
    };

    const redirectOnSuccess = () => {
        navigate(0);
    }

    const redoPurchase = () => {
        setPurchaseResetter(prev => !prev);
    }

    const { theme } = useTheme();
    const rootClassName = theme === 'dark' ? styles.darkRoot : styles.lightRoot;
    const mainClassName1 = theme === 'dark' ? styles.darkMain : styles.lightMain;
    const lineUpTheme = theme === 'dark' ? styles.darkLineUp : styles.lightLineUp;

    return (
        <div className={`${styles.root} ${rootClassName}`}>
            {!isLoading && (
                <>
                    <EventCard
                        data={data}
                        showUpperBubble
                        cardType="description"
                    />
                    <div className={`${styles.main} ${mainClassName1}`}>
                        <div className={styles.mainAboutEvents}>
                            <h1>O событии</h1>
                            <p className={styles.eventDescriptionText}>{data!.description}</p>
                        </div>
                        <div className={styles.lineUp}>
                            {isArtistLoading && <Spinner />}
                            {!isArtistLoading && artistData && artistData?.length > 0 && (
                                <>
                                    <h2>Лайн-ап</h2>
                                    <Lineup artists={artistData!} />
                                </>
                            )}
                        </div>

                        {!alreadyPurchasedLoading && isAlreadyPurchased &&
                            (pageType === 'userPage' ? eventType !== 'free' : true) ?
                        (
                            <Button
                                className={styles.alreadyPurchasedButton}
                                text={shortEventTypeToWordsMap.get(eventType) === 'Бесплатная вечеринка' ?
                                    'Вы зарегистрированы':
                                    'У вас уже есть билет'
                                }
                                type='realBlue'
                            />
                        ) : (
                            <div className={styles.btnIndentation}>
                                {shortEventTypeToWordsMap.get(eventType) === 'Бесплатная вечеринка' && (
                                    <>
                                        <FormValidationContext.Provider value={{ isValid, setIsValid, showErrorLabel, setShowErrorLabel }}>
                                            <div>
                                                <GuestList guestList={guestList} setGuestList={setGuestList} />
                                            </div>
                                            {showErrorLabel && <p>{'Заполнены не все поля'}</p>}
                                            <Button text='Зарегистрироваться' onClick={() => buyTickets('free')} type={"blue"} />
                                        </FormValidationContext.Provider>
                                    </>
                                )}
                                {shortEventTypeToWordsMap.get(eventType) === 'Депозит' && (
                                    <>
                                        <h3>Цена: {data!.price}</h3>
                                        <Button text='Внести депозит' onClick={() => {
                                            setShouldBuyWithBonuses(false);
                                            setPurchaseType('deposit');
                                            redoPurchase();
                                        }} type="blue" />
                                    </>
                                )}
                                {shortEventTypeToWordsMap.get(eventType) === 'Ивент' && (
                                    <>
                                        <h3>Цена: {data!.price}</h3>
                                        <Button text='Купить билет' onClick={() => {
                                            setShouldBuyWithBonuses(false);
                                            setPurchaseType('event');
                                            redoPurchase();
                                        }} type="blue" />
                                        <Button text='Купить билет баллами' onClick={() => {
                                            setShouldBuyWithBonuses(true);
                                            setPurchaseType('event');
                                            redoPurchase();
                                        }} type="blue" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <Modal
                        className={styles.statusModal}
                        open={isModalOpen}
                    >
                        <div>
                            {isStatusLoading && <Spinner><p>Ваш запрос обрабатывается</p></Spinner>}
                            {!isStatusLoading && (
                                <div>
                                    {(
                                        ticketStatusData?.status === 'Success' || 
                                        ticketStatusData?.message === 'Ticket purchased successfully'
                                    ) && (
                                        <div>
                                            <p>Готово!</p>
                                            <Button text='Ок' onClick={redirectOnSuccess} />
                                        </div>
                                    )}
                                    {(
                                        ticketStatusData?.status !== 'Success' && 
                                        ticketStatusData?.message !== 'Ticket purchased successfully' &&
                                        !ticketStatusData?.PaymentURL
                                    ) && (
                                        <div>
                                            <p>{ticketPurchaseStatusAnswerMap.get(ticketStatusData?.message || '')
                                                // @ts-ignore
                                                || ticketStatusData?.error?.Details
                                                || ticketStatusData?.message
                                                || 'Что-то пошло не так...'}
                                            </p>
                                            <Button text='Закрыть' onClick={() => setIsModalOpen(false)} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Modal>
                </>
            )}

        </div>
    );
};

export default EventDetailsPage;
