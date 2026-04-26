import { sendOperation } from "./webrtcUi";

export function dispatchOperation(op, setUiTree, applyOperation) {
  // 1. update local UI
  applyOperation(op, setUiTree);

  // 2. send to peer
  sendOperation(op);
}
