import React, { ChangeEvent, useState } from "react";

import LocationCityIcon from "@material-ui/icons/LocationCity";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import { useTranslation } from "react-i18next";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import { Company } from "./participants/Company";
import { Box, Tab } from "@material-ui/core";
import { TabList, TabPanel, TabContext } from "@material-ui/lab";

import { ProjectParticipantsGroup } from "../../../../types/ProjectTypes";
import { User } from "./participants/User";
import { Invite } from "./participants/Invite";

interface IparticipantsTabBox {
  setOpenAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  group: ProjectParticipantsGroup;
}

const ParticipantsTabBox: React.FC<IparticipantsTabBox> = ({
  setOpenAddForm,
  group,
}) => {
  const [tabId, setTabId] = useState<string>("1");
  const { t, i18n } = useTranslation();

  const handleChange = (event: ChangeEvent<{}>, newValue: string) => {
    setTabId(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TabContext value={tabId}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="basic tabs example">
            <Tab
              value="1"
              icon={<LocationCityIcon />}
              label={t("participants-tab-box.tab-list.company")}
            />
            <Tab
              value="2"
              icon={<GroupAddIcon />}
              label={t("participants-tab-box.tab-list.user")}
            />
            <Tab
              value="3"
              icon={<ContactMailIcon />}
              label={t("participants-tab-box.tab-list.invite")}
            />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Company setOpenAddForm={setOpenAddForm} group={group} />
        </TabPanel>
        <TabPanel value="2">
          <User setOpenAddForm={setOpenAddForm} group={group} />
        </TabPanel>
        <TabPanel value="3">
          <Invite setOpenAddForm={setOpenAddForm} group={group} />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export default ParticipantsTabBox;
