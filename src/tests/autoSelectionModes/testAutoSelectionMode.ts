import { type EditorPosition } from "obsidian";
import { type CursorOrSelectionAction, type CursorPositions } from "../../utils/selectionUtils";

export type BeforePositions = {
  start: EditorPosition;
  end: EditorPosition;
  from: EditorPosition;
  to: EditorPosition;
};

export type AfterPositions = {
  start: EditorPosition;
  end: EditorPosition;
  from: EditorPosition;
  to: EditorPosition;
  titleStart: EditorPosition;
  titleEnd: EditorPosition;
};

export type BeforeAndAfter = {
  before: BeforePositions;
  after: AfterPositions;
};

export type GetExpected = ({
  after,
  originalCursorPositions,
}: {
  after: AfterPositions;
  originalCursorPositions: CursorPositions;
}) => CursorOrSelectionAction;
