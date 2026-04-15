import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function AppModal({
                                   show,
                                   onHide,
                                   title,
                                   body,
                                   confirmText = "OK",
                                   cancelText,
                                   onConfirm,
                                   centered = true,
                                 }) {
  return (
    <Modal show={show} onHide={onHide} centered={centered} className={"custom-modal"}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{body}</Modal.Body>

      <Modal.Footer>
        {cancelText && (
          <Button variant="warning" onClick={onHide} className={"nav"}>
            {cancelText}
          </Button>
        )}

        <Button
          className={"nav"}
          variant="success"
          onClick={() => {
            if (onConfirm) onConfirm();
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
