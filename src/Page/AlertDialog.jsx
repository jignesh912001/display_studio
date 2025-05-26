import React from "react";
import { Dialog, Button, Classes } from "@blueprintjs/core";

const SaveAlert = ({
  isDialogOpen,
  setIsDialogOpen,
  handleDialogYes,
  onCancel,
  handleClearSession
}) => {



  return (
    <Dialog
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      title="Save Design"
      className="custom-save-dialog"
      style={{
        width: "500px",
        height: "250px",
        borderRadius: "6px",
        boxShadow: "0 8px 30px rgba(192, 176, 176, 0.2)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <div
        className={Classes.DIALOG_BODY}
        style={{
          fontSize: "16px",
          padding: "30px 20px",
          textAlign: "center",
          lineHeight: "1.5",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <strong>Do you want to save this design?</strong>
      </div>

      <div
        className={Classes.DIALOG_FOOTER}
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <Button
          style={{
            backgroundColor: "#f44336",
            color: "white",
            borderRadius: "6px",
            padding: "8px 10px",
            flex: 1,
            marginRight: "10px"
          }}
          onClick={handleClearSession}
        >
          Not Save, Clear
        </Button>

        <Button
          style={{
            backgroundColor: "#e0e0e0",
            color: "#333",
            borderRadius: "6px",
            padding: "8px 10px",
            flex: 1,
            marginRight: "10px"
          }}
          onClick={() => {
            setIsDialogOpen(false);
            if (onCancel) onCancel();
          }}
        >
          No
        </Button>

        <Button
          intent="primary"
          style={{
            backgroundColor: "#137cbd",
            borderRadius: "6px",
            padding: "8px 10px",
            flex: 1
          }}
          onClick={() => {
            setIsDialogOpen(false);
            handleDialogYes();
          }}
        >
          Yes, Save
        </Button>
      </div>
    </Dialog>
  );
};

export default SaveAlert;
