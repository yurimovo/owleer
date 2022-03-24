import React, { useEffect, useState } from "react";

import { Circle, Image, Layer, Stage, Line, Text } from "react-konva";
import { ModalIssueComment } from "../modal-window/ModalIssueComment";
import { ModalAddNewIssue } from "../modal-window/add-new-issue/ModalAddNewIssue";
import { fetchFileIssues } from "../../../../utils/files/fetchFileIssues";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIssueFileProjectAction,
  setContextIssueAction,
  setOpenIssueModalAction,
} from "../../../../actions/actions";
import { upsertFilePageData } from "../../../../utils/files/upsertFilePageData";
import { fetchFilePageData } from "../../../../utils/files/fetchFilePageData";

export const ImageCanvas = ({
  undoFlag,
  pageNumber,
  addNewIssue,
  drawMode,
  fileImage,
  hoverIssue,
  showIssues,
  fileData,
                              filterIssues,
                              emailsOnFilter
}) => {
  const dispatch = useDispatch();
  const [openModalNewElement, setOpenModalNewElement] = useState(false);
  const [isDragging, setIsDragging] = useState({
    isDragging: false,
    x: window.innerWidth / 2.5,
    y: window.innerHeight / 10,
  });
  const [scale, setScale] = useState({
    scale: 0.3,
    x: 0,
    y: 0,
  });
  const fileUid = window.location?.pathname.split("/")[2];
  const [newIssue, setNewIssue] = useState(null);
  const issuesList = useSelector((state) => state.projects.file.issues);
  const contextIssue = useSelector((state) => state.projects.file.contextIssue);
  const openIssueModal = useSelector(
    (state) => state.projects.file.openIssueModal
  );

  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState( []);
  const isDrawing = React.useRef(false);

  useEffect(() => {
    if (fileData?.lines) {
      setLines(fileData?.lines)
    }
  }, [fileData])

  const handleMouseDown = (e) => {
    isDrawing.current = true && drawMode;
    const x = e.evt.layerX / scale.scale - (isDragging.x + scale.x);
    const y = e.evt.layerY / scale.scale - (isDragging.y + scale.y);
    setLines([...lines, { tool, points: [x, y] }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current || !drawMode) {
      return;
    }
    const x = e.evt.layerX / scale.scale - (isDragging.x + scale.x);
    const y = e.evt.layerY / scale.scale - (isDragging.y + scale.y);
    let lastLine = lines[lines.length - 1];
    // add point
    (lastLine || { points: [] }).points = (
      lastLine || { points: [] }
    ).points.concat([x, y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      upsertFilePageData(fileUid, pageNumber, { lines: lines });
    }

    isDrawing.current = false;
  };

  const handleCloseModalNewElement = () => {
    setOpenModalNewElement(false);
  };

  const handleOpenModal = (issue) => {
    dispatch(setContextIssueAction(issue));
    dispatch(setOpenIssueModalAction(true));
  };

  const handleCloseModal = () => {
    dispatch(setContextIssueAction(null));
    dispatch(setOpenIssueModalAction(false));
  };

  const handleClickImage = (e) => {
    if (addNewIssue) {
      setOpenModalNewElement(true);
      const x = e.evt.layerX / scale.scale - (isDragging.x + scale.x);
      const y = e.evt.layerY / scale.scale - (isDragging.y + scale.y);
      const circle = {
        x,
        y,
        radius: 10,
      };
      setNewIssue(circle);
    }
  };

  const handleScale = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    /*    const mousePointTo = {
          x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
          y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        };*/

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale({
      scale: newScale,
      x: 0,
      y: 0,
      /*      ===interactive zoom===
                  x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
                  y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale*/
    });
  };

  useEffect(() => {
    fetchFileIssues(fileUid, { page: pageNumber, user_emails: [] })
      .then((r) => dispatch(fetchIssueFileProjectAction(r)))
      .catch((e) => console.log(e));
  }, [fileUid, dispatch]);

  useEffect(() => {
    fetchFilePageData(fileUid, pageNumber).then((data) => {
      setLines(data?.lines || []);
    });
  }, [undoFlag]);

  useEffect(() => {
    if (undoFlag > 0 && lines.length) {
      const newLines = lines;
      newLines.pop();

      upsertFilePageData(fileUid, pageNumber, { lines: newLines }).then(() => {
        setLines(newLines);
      });
    }
  }, [undoFlag]);

  return (
    <>
      <ModalAddNewIssue
        pageNumber={pageNumber}
        fileUid={fileUid}
        newIssue={newIssue}
        openModal={openModalNewElement}
        handleCloseModal={handleCloseModalNewElement}
      />
      <ModalIssueComment
        pageNumber={pageNumber}
        fileUid={fileUid}
        openModal={openIssueModal}
        selectIssue={contextIssue}
        handleCloseModal={handleCloseModal}
      />
      <Stage
        style={{ cursor: `${addNewIssue ? "crosshair" : "default"}` }}
        width={window.innerWidth}
        height={window.innerHeight}
        onWheel={(e) => handleScale(e)}
        scaleX={scale.scale}
        scaleY={scale.scale}
        x={scale.x}
        y={scale.y}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          <Image
            draggable={!drawMode}
            x={isDragging.x}
            y={isDragging.y}
            image={fileImage}
            onDragStart={() => {
              setIsDragging({
                ...isDragging,
                isDragging: true,
              });
            }}
            onDragMove={(e) => {
              setIsDragging({
                ...isDragging,
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onDragEnd={(e) => {
              setIsDragging({
                isDragging: true,
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onClick={(e) => {
              handleClickImage(e);
            }}
          />
          {lines.map((line, i) => {
            const offsetOPoints = [];
            for (let i = 0; i < line.points.length; i++) {
              if (i % 2 == 1) {
                offsetOPoints.push(line.points[i] + isDragging?.y);
              } else {
                offsetOPoints.push(line.points[i] + isDragging?.x);
              }
            }

            return (
              <Line
                key={i}
                points={offsetOPoints}
                stroke="#df4b26"
                strokeWidth={5}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            );
          })}
          {showIssues
            ? null
            : ((emailsOnFilter.length > 0 ? filterIssues : issuesList) || []).map((issue) => {
                return (
                  <Circle
                    x={issue.data.x + isDragging?.x}
                    y={issue.data.y + isDragging?.y}
                    radius={3 * 3}
                    fill={issue.data.color}
                    onClick={() => handleOpenModal(issue)}
                    shadowBlur={5}
                    opacity={0.6}
                  />
                );
              })}
          {hoverIssue ? (
            <Circle
              x={hoverIssue.data.x + isDragging?.x}
              y={hoverIssue.data.y + isDragging?.y}
              radius={3 * 12}
              fill={hoverIssue.data.color}
              opacity={0.5}
            />
          ) : null}
        </Layer>
      </Stage>
    </>
  );
};
