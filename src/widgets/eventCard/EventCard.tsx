import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import descriptionStyles from './styles2.module.scss'; // TODO: поменять название
import { TEvent } from '../../shared/types';
import Button from '../../shared/ui/button';
import EventInfoText from '../eventInfoText';
import classNames from 'classnames';
import { Drawer } from '@mui/material';
import EventDetailsPage from '../../pages/eventDetailsPage';
import EventQr from '../eventQr';
import { splitDatetimeString } from '../../shared/utils';
import { useQuery } from '@tanstack/react-query';
import { uploadImage } from '../../entities/event/api';

type Props = {
  data: TEvent
  hasInfoButton?: boolean
  showUpperBubble: boolean
  customUpperBubbleText?: string
  customActionButtonText?: string
  customActionButtonAction?: (
    e?: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void
  showActionButton?: boolean
  cardType: 'base' | 'description' | 'userPage'
}
const EventCard = ({
  data,
  showUpperBubble,
  customUpperBubbleText,
  showActionButton,
  customActionButtonAction,
  customActionButtonText,
  cardType = 'base',
  hasInfoButton = false,
}: Props) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState('');
  const toggleEventDetailsModal = (value: boolean) => {
    setIsEventDetailsModalOpen(value);
    if (!value) setPurchaseType('');
  }

  let { dateandtime, short_name, place, event_id, age_restriction, img_path, event_type } = data;
  const buyTickets = () => setIsQrModalOpen(true);
  const {data: imgData, isLoading: isImgDataLoading} = useQuery({
    queryKey: [`imgData-${event_id}`, img_path],
    queryFn: () => uploadImage(img_path),
    staleTime: 120000,
    refetchOnMount: false,
  })

  place = place.split('/')[0];
  const time = `с ${splitDatetimeString(dateandtime)[1]}`;

  return (
    <>
      <div
        className={classNames(
          cardType === 'description' ? descriptionStyles.root: styles.root,
        )}
        onClick={(e) => {
          if (cardType === 'base') {
            toggleEventDetailsModal(true);
          }
          else if (cardType === 'userPage') {
            // @ts-ignore
            if (e.target.textContent === 'Изменить бронь') toggleEventDetailsModal(true)
            else if (
              // @ts-ignore
              !e.target.classList.contains('MuiBackdrop-root') &&
              // @ts-ignore
              !e.target.textContent === 'Изменить бронь'
            ) setIsQrModalOpen(true);
          }
        }}
      >
        {showUpperBubble && (
          <div
            className={cardType === 'description' ? descriptionStyles.rootTime: styles.rootTime}
          >
            {customUpperBubbleText ?? time}
          </div>
        )}
        <EventInfoText data={{ dateandtime, short_name, place, age_restriction }} cardType={cardType} />
        {!!showActionButton && !hasInfoButton && (
          <Button
            className={cardType === 'description' ? descriptionStyles.buttonBuy : styles.buttonBuy}
            text={customActionButtonText ?? 'Купить билет'}
            type="realBlue"
            onClick={customActionButtonAction ?? buyTickets}
          />
        )}
        {!!showActionButton && hasInfoButton && (
          <div className={styles.multiButtonContainer}>
            <Button
              className={cardType === 'description' ? descriptionStyles.buttonBuy : styles.buttonBuy}
              text={'Информация'}
              type="realBlue"
              onClick={buyTickets}
            />
            <Button
              className={cardType === 'description' ? descriptionStyles.buttonBuy : styles.buttonBuy}
              text={customActionButtonText ?? 'Купить билет'}
              type="realBlue"
              onClick={customActionButtonAction ?? buyTickets}
            />
          </div>
        )}

        {cardType === 'userPage' && (
          <EventQr
            eventId={event_id}
            isModalOpen={isQrModalOpen}
            setIsModalOpen={setIsQrModalOpen}
          />
        )}
      </div>

      {cardType !== 'description' && (
          <Drawer
            variant='temporary'
            anchor='bottom'
            open={isEventDetailsModalOpen}
            onClose={() => toggleEventDetailsModal(false)}
          >
            <div style={{height: '60vh'}}>
              <EventDetailsPage
                eventId={event_id}
                pageType={cardType === 'userPage' ? cardType: 'default'}
                purchaseType={purchaseType}
                setPurchaseType={setPurchaseType}
              />
            </div>
          </Drawer>
        )}
    </>
  )
}

export default EventCard
