import {
  Avatar,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Typography,
} from "@material-ui/core";
import { BoardType } from "../../../../types/integration/mondayIntegrationType";
import { useTranslation } from "react-i18next";
import { lastModifiedTime } from "../../../../utils/timeUtils";
import { useHistory } from "react-router-dom";

interface Iboard {
  board: BoardType;
}

export const BoardCard: React.FC<Iboard> = ({ board }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  const onClickBoardCard = () => {
    history.push(`/integrations/monday/board/${board.id}`);
  };

  return (
    <Card
      style={{
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <CardActionArea onClick={onClickBoardCard}>
        <CardHeader
          avatar={<Avatar src={board.owner.photo} />}
          title={
            <Typography style={{ fontWeight: "bold" }}>{board.name}</Typography>
          }
          subheader={lastModifiedTime(board.updated_at)}
        />
        <CardContent></CardContent>
      </CardActionArea>
    </Card>
  );
};
