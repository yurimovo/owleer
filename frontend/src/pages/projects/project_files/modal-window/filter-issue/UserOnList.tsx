import {Checkbox, ListItem, ListItemText, Switch, Typography} from "@material-ui/core";
import * as React from "react";
import {ChangeEvent, useEffect, useState} from "react";

interface UserOnList {
    name: string,
    email: string,
    role: string,
    emailsOnFilter: Array<string>,
    handleAddEmail: (e: ChangeEvent<HTMLInputElement>) => void
}

export const UserOnList: React.FC<UserOnList> = ({name, email, handleAddEmail, role, emailsOnFilter}) => {

    const [select, setSelect] = useState<boolean>(false);

    const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
        handleAddEmail(e);
        setSelect(!select)
    };

    useEffect(() => {
        emailsOnFilter.includes(email) ? setSelect(true) : setSelect(false)
    },[])


    return (
        <div style={{display: "flex", alignItems: "center"}}>
            <ListItem>
                <ListItemText primary={name} secondary={role} />
            </ListItem>
            <Switch color="primary" style={{paddingLeft: 10}}  value={email} onChange={handleSelect} checked={select}/>
        </div>
    )
}