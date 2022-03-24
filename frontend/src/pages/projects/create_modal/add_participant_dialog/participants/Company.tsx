import {
  Avatar,
  Input,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ProjectCompanyParticipant,
  ProjectParticipantsGroup,
} from "../../../../../types/ProjectTypes";
import SearchIcon from "@material-ui/icons/Search";
import { searchCompanies } from "../../../../../utils/companies/searchCompanies";
import BusinessIcon from "@material-ui/icons//Business";
import List from "@material-ui/core/List";
import { OrganizationInSearchList } from "../../../../../types/OrganizationTypes";

type CompanyProps = {
  group: ProjectParticipantsGroup;
  setOpenAddForm(value: boolean): void;
};
export const Company: React.FC<CompanyProps> = ({ group, setOpenAddForm }) => {
  const [companies, SetCompanies] = useState<Array<OrganizationInSearchList>>(
    []
  );
  const { t, i18n } = useTranslation();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const searchResult = await searchCompanies(e.target.value);
      SetCompanies(searchResult);
    } catch (e) {}
  };

  const handleRecordClick = (companyRecord: OrganizationInSearchList) => {
    group.companies.push({
      name: companyRecord.name,
      uid: companyRecord.uid,
      role: "",
    } as ProjectCompanyParticipant);
    setOpenAddForm(false);
  };

  return (
    <div>
      <Input
        placeholder={t("participants.company.name")}
        onChange={handleSearch}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />
      <List component="nav">
        {companies.map((c: OrganizationInSearchList) => {
          return (
            <ListItem button onClick={() => handleRecordClick(c)}>
              <ListItemAvatar>
                <Avatar>
                  <BusinessIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={c.name} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};
