import React from "react"
import { crossSignIconDark, crossSignIconLight } from "../../assets";
import { GuestInviteForm } from "../../types";
import styles from './styles.module.scss'
import { useTheme } from "../themeContext/ThemeContext";

type Props = {
    id: number,
    setGuestList: React.Dispatch<React.SetStateAction<GuestInviteForm[]>>,
    guestList: GuestInviteForm[],
}
const GuestForm = ({ id, guestList, setGuestList }: Props) => {
    const removeGuest = () => {
        setGuestList(prev => {
            if (id <= 0) return prev;
            let newObj = structuredClone(prev);
            newObj.splice(id, 1);
            return newObj;
        })
    };
    const handleChange = (trigger: 'name' | 'username', value: string) => {
        setGuestList(prev => {
            let newObj = structuredClone(prev);
            newObj[id][trigger] = value;
            return newObj;
        })
    }

    const { theme } = useTheme();
    const crossIcon = theme === 'dark' ? crossSignIconDark : crossSignIconLight;
    const inputThemeClass = theme === 'dark' ? styles.inputDark : styles.inputLight;

    return (
        <div className={styles.root}>
            <div className={styles.guestInfo}>
                <h3>Гость №{id + 1}</h3>
                {id > 0 && (
                    <button onClick={removeGuest}>
                        <img src={crossIcon} />
                    </button>
                )}
            </div>
            <div className={styles.infoInputs}>
                <input
                    type="text"
                    className={inputThemeClass}
                    placeholder="Имя Фамилия"
                    onChange={e => handleChange('name', e.target.value)}
                    value={guestList[id].name}
                />
                <input
                    type="text"
                    className={inputThemeClass}
                    placeholder="Telegram"
                    onChange={e => handleChange('username', e.target.value)}
                    value={guestList[id].username}
                />
            </div>

        </div>
    )
};

export default GuestForm;
