import React, { useContext, useEffect, useState } from "react"
import { plusSignIconDark, plusSignIconLight } from "../../shared/assets";
import { GuestInviteForm } from "../../shared/types";
import { defaultGuestListNumber, maxEventGuestCount } from "../../shared/constants";
import GuestForm from "../../shared/ui/guestForm";
import styles from './styles.module.scss';
import { FormValidationContext } from "../../app/context";
import { validateGuests } from "../../shared/utils";
import { useTheme } from "../../shared/ui/themeContext/ThemeContext";

type Props = {
    guestList: GuestInviteForm[],
    setGuestList: React.Dispatch<React.SetStateAction<GuestInviteForm[]>>,
}
const GuestList = ({ guestList, setGuestList }: Props) => {
    const { setIsValid } = useContext(FormValidationContext)!;
    const addGuest = () => setGuestList(prev => {
        let newObj = structuredClone(prev);
        if (newObj.length < maxEventGuestCount) newObj.push({ name: '', username: '' });
        return newObj;
    });

    useEffect(() => {
        const isValidationPassed = validateGuests(guestList);
        setIsValid(isValidationPassed);
    }, [guestList]);

    const { theme } = useTheme();
    const plusIcon = theme === 'dark' ? plusSignIconDark : plusSignIconLight;

    return (
        <div className={styles.root}>
            <div className={styles.main}>
                {guestList.map((_, i) => (
                    <GuestForm key={i} id={i} guestList={guestList} setGuestList={setGuestList} />
                ))}
            </div>
            <button onClick={() => addGuest()}>
                <img src={plusIcon} />
                <p>Добавить гостя</p>
            </button>
        </div>
    )
};

export default GuestList;
