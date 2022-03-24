import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  BoardItem,
  BoardItemColumn,
} from "../../../../types/integration/mondayIntegrationType";
import Loader from "../../../../utils/elements/Loader";
import { fetchBoardItems } from "../../../../utils/integratons/monday/fetchBoardItems";
import { lastModifiedTime } from "../../../../utils/timeUtils";

export default function MondayBoard() {
  const history = useHistory();
  const url = history.location.pathname.split("/");
  const [boardItems, setBoardsItems] = useState<Array<BoardItem>>([]);
  const [columns, setColumns] = useState<Array<string>>([]);
  const [boardName, setBoardName] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  useState(() => {
    setLoading(true);
    fetchBoardItems(url[4])
      .then(
        (itemsResponse: {
          board_name: string;
          items: Array<BoardItem>;
          columns: Array<string>;
        }) => {
          setBoardName(itemsResponse.board_name);
          setBoardsItems(itemsResponse.items);
          setColumns(itemsResponse.columns);
        }
      )
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <Typography
            variant="h5"
            color="primary"
            align="center"
            style={{ margin: 20 }}
          >
            {boardName}
          </Typography>
          <Table dir="ltr" style={{ padding: 20 }}>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Created At</TableCell>
                {columns.map((column: string) => {
                  return <TableCell>{column}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {boardItems.map((item: BoardItem) => {
                return (
                  <TableRow>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{lastModifiedTime(item.created_at)}</TableCell>
                    {item.colums.map((columnValue: BoardItemColumn) => {
                      const backgroundColor =
                        columnValue.additional_info?.color || "#FFFFFF";
                      return (
                        <TableCell
                          dir="ltr"
                          style={{ backgroundColor: backgroundColor }}
                        >
                          {columnValue.text}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
