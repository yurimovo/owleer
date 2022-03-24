import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Link,
} from "@material-ui/core";
import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { ProjectEvent } from "../../types/ProjectTypes";
import { State } from "../../types/ReducerTypes";
import Loader from "../../utils/elements/Loader";
import { paginateEvents } from "../../utils/projects/paginateEvents";
import InfiniteScroll from "react-infinite-scroll-component";
import { handleEventPicture } from "../../utils/events/handleEventPicture";
import { useTranslation } from "react-i18next";
import { lastModifiedTime } from "../../utils/timeUtils";

export const EventFeed = () => {
  const contextProject = useSelector(
    (state: State) => state.projects.contextProject
  );
  const { t } = useTranslation();
  const [events, setEvents] = useState<Array<ProjectEvent>>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    setEvents([]);
    setHasMore(true);
    setPage(1);

    if (contextProject) {
      paginateEvents(contextProject?.uid, 0, 10).then((result) => {
        setEvents(result.events);
        setTotal(result.total);
        const eventsAmount = result.events.length;

        const calcHasMore = result.total > eventsAmount;

        setHasMore(calcHasMore);
      });
    }
  }, [contextProject]);

  const loadMore = async () => {
    if (total > events.length) {
      paginateEvents(contextProject?.uid, page, 10).then((result) => {
        setEvents([...events, ...result.events]);

        const eventsAmount = events.length + result.events.length;

        const calcHasMore = result.total > eventsAmount;
        setHasMore(calcHasMore);
        if (calcHasMore) {
          setPage(page + 1);
        }
      });
    }
  };

  const renderActions = (eventType: string, data: object) => {
    if (eventType == "COMMENT_PLACED" || eventType == "ISSUE_CREATED") {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            window.open(`/files/${data?.file_uid}`, "_blank");
          }}
        >
          {t("event-feed.buttons.open-file")}
        </Button>
      );
    }

    if (eventType == "REPORT_GENERATED") {
      return (
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            window.open(`/files/${data?.file_uid}`, "_blank");
          }}
        >
          {t("event-feed.buttons.open-report")}
        </Button>
      );
    }
  };

  const eventCard = (event: ProjectEvent) => {
    return (
      <Card
        style={{
          margin: 15,
          width: "600x",
          maxWidth: "600px",
          minHeight: "400px",
        }}
      >
        <CardHeader
          avatar={<Avatar>{event.initiator.name[0]}</Avatar>}
          title={
            <Typography
              color="primary"
              style={{ fontWeight: "bold" }}
            >{`${event.initiator.name} - ${event.initiator.role}`}</Typography>
          }
          subheader={lastModifiedTime(event.created_at)}
        />
        <CardContent>
          <Typography>{event.name}</Typography>
          {event.type == "FILES_SENT" ? (
            <Paper>
              <Typography style={{ margin: 10 }}>
                {event.data.message}
              </Typography>
            </Paper>
          ) : null}
          <div>
            {
              <List component="nav">
                {event.data.files?.map(
                  (file: { file_name: string; uid: string }) => {
                    return (
                      <Link
                        onClick={() => {
                          window.open(`/files/${file.uid}`, "_blank");
                        }}
                      >
                        <ListItem button>
                          <ListItemText primary={file.file_name} />
                        </ListItem>
                      </Link>
                    );
                  }
                )}
              </List>
            }
          </div>
        </CardContent>
        <CardMedia style={{ display: "flex", justifyContent: "center" }}>
          {handleEventPicture(event.type)}
        </CardMedia>
        <CardActions>{renderActions(event.type, event.data)}</CardActions>
      </Card>
    );
  };

  return (
    <Grid container alignContent="center" justifyContent="center">
      {events.length ? (
        <InfiniteScroll
          dataLength={events.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<Loader />}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>{t("event-feed.all-seen")}</b>
            </p>
          }
          pullDownToRefresh={false}
          refreshFunction={loadMore}
          pullDownToRefreshThreshold={5}
        >
          {events.map((event: ProjectEvent) => {
            return eventCard(event);
          })}
        </InfiniteScroll>
      ) : (
        <Typography
          variant="h5"
          component="h1"
          style={{ paddingTop: "20%", color: "#D3D3D3" }}
        >
          {t("event-feed.no-event")}
        </Typography>
      )}
    </Grid>
  );
};
