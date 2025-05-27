import React from "react";
import { Dialog } from "@blueprintjs/core";

const PreviewDialog = ({ isPreviewOpen, setPreviwOpen, preview }) => {
  return (
    <Dialog
      isOpen={isPreviewOpen}
      onClose={() => setPreviwOpen(false)}
      title="Preview"
      style={{
        width: "600px",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div
        style={{
          padding: "5px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          maxHeight: "80vh",
          overflowY: "auto",
          marginTop: "10px",
        }}
      >
        {Array.isArray(preview) && preview.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            {preview?.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`Design Preview ${index + 1}`}
                style={{
                  maxWidth: "100%",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default PreviewDialog;
