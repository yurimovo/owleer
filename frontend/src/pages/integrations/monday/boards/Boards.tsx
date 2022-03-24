import { Grid, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { BoardType } from "../../../../types/integration/mondayIntegrationType";
import Loader from "../../../../utils/elements/Loader";
import { fetchBoards } from "../../../../utils/integratons/monday/fetchBoards";

import { BoardCard } from "./BoardCard";

export default function Boards() {
  const [boards, setBoards] = useState<Array<BoardType>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchBoards()
      .then((boards: Array<BoardType>) => {
        setBoards(boards);
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <Grid container xs={12} spacing={1}>
          <Grid item xs={12}>
            <Typography
              style={{ margin: 10 }}
              align="center"
              color="primary"
              variant="h5"
            >
              Boards
            </Typography>
          </Grid>
          {(boards || []).map((board: BoardType) => {
            return (
              <Grid item xs={3}>
                <BoardCard board={board} />
              </Grid>
            );
          })}
        </Grid>
      )}
    </div>
  );
}
