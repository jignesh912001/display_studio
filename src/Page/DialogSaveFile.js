import React from "react";
import { Dialog, FormGroup, InputGroup, Button } from "@blueprintjs/core";

const SaveFileDialog = ({ isDialogOpen,
    setDialogOpen,
    fileName,
    setFileName,
    progress,
    loading,
    downloadVideo,
    saveAssetsImage,
    downloadImage
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
                backgroundColor: "#fff",
            }}
        >
            <div
                className="bp4-dialog-body"
                style={{
                    padding: "5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
            >
                <FormGroup
                    label="Enter file name"
                    labelFor="file-name-input"
                    style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#4a4a4a",
                    }}
                >
                    <InputGroup
                        id="file-name-input"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="Enter file name"
                        style={{
                            borderRadius: "8px",
                            border: "1px solid #dcdcdc",
                            padding: "8px",
                        }}
                    />
                </FormGroup>
            </div>

            <div
                className="bp4-dialog-footer"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
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
                        backgroundColor: loading ? "#007bff" : "#004aad",
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? progress > 0 ? `Downloading... ${progress}%` : "Downloading..." : "Save Video and Download"}
                </Button>
                {/* <Button
                    intent="primary"
                    onClick={downloadImage}
                    style={{
                        backgroundColor: loading ? "#007bff" : "#004aad",
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Save Image
                </Button> */}
                <Button
                    intent="primary"
                    onClick={saveAssetsImage}
                    style={{
                        backgroundColor: loading ? "#007bff" : "#004aad",
                        border: "none",
                        color: "#fff",
                        borderRadius: "8px",
                        padding: "10px 20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    Save Assets
                </Button>
            </div>
        </Dialog>
    );
};

export default SaveFileDialog;
