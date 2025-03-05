import React from "react";
import { Dialog, FormGroup, InputGroup, Button, ProgressBar } from "@blueprintjs/core";

const SaveFileDialog = ({ isDialogOpen,
    setDialogOpen,
    fileName,
    setFileName,
    progress,
    loading,
    downloadVideo,
    saveAssetsImage,
    saving
}) => {

    return (
        <Dialog
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Save File"
            style={{
                width: "600px",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                // backgroundColor: "#fff",
            }}
        >
            <div
                style={{
                    padding: "5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    marginTop: "10px"
                }}
            >
                <FormGroup
                    label="Enter file name"
                    labelFor="file-name-input"
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                    }}
                >
                    <InputGroup
                        id="file-name-input"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                        style={{
                            borderRadius: "8px",
                            padding: "8px",
                            color: "#FFF",
                            fontWeight: "bold"
                        }}
                    />
                </FormGroup>
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px", // Adds spacing between buttons
                    marginTop: "20px",
                }}
            >
                <Button
                    onClick={() => setDialogOpen(false)}
                    style={{
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #ccc",
                        color: "#333",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                    }}
                >
                    Cancel
                </Button>

                <Button
                    disabled={loading}
                    intent="primary"
                    onClick={downloadVideo}
                    style={{
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? (progress > 0 ? `Downloading... ${progress}%` : "Downloading...") : "Save Video"}
                </Button>

                <Button
                    intent="primary"
                    onClick={saveAssetsImage}
                    style={{
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    {saving ? "Saving.." : " Save Assets"}
                </Button>
            </div>
        </Dialog>

    );
};

export default SaveFileDialog;
