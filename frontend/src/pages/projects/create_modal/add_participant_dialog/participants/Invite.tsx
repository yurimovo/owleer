import { Button, Input } from "@material-ui/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ProjectParticipantsGroup,
  ProjectUserParticipant,
} from "../../../../../types/ProjectTypes";

type InviteProps = {
  group: ProjectParticipantsGroup;
  setOpenAddForm(value: boolean): void;
};
export const Invite: React.FC<InviteProps> = ({ group, setOpenAddForm }) => {
  const [mail, setMail] = useState<string>("");
  const { t, i18n } = useTranslation();

  const handlOnClick = () => {
    group.users.push({ email: mail } as ProjectUserParticipant);
    setOpenAddForm(false);
  };

  return (
    <div>
      <Input
        placeholder={"Email"}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setMail(e.target.value)
        }
      />
      <Button onClick={handlOnClick} color="primary" variant="contained">
        {t("participants.invite.invite-btn")}
      </Button>
    </div>
  );
};
