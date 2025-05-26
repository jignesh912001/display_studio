import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@blueprintjs/core";
import { ImagesGrid, SectionTab } from "polotno/side-panel";
import FaCloudUploadAlt from "@meronex/icons/fa/FaCloudUploadAlt";
import { getImages, saveImage } from "../API/UploadImage";
import { getAssetsAction, saveAssetsAction } from "../API/APICallingAll";
import { getImageSize } from "polotno/utils/image";

const UploadPanel = {
  name: "uploaad",
  Tab: (props) => (
    <SectionTab name="Upload" {...props}>
      <FaCloudUploadAlt icon="new-text-box" />
    </SectionTab>
  ),
  Panel: ({ store }) => {
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadImage = async () => {
      const response = await getAssetsAction({
        assetsType: "CanvaUploadImage",
      });
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      const data = response.data.data;
      setImages(data);
      setFilteredImages(data);
      setIsLoading(false);
    };

    const handleFileInput = async (e) => {
      const { target } = e;
      const files = e.target.files;
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("File", file);
      });
      formData.append("Operation", "Insert");
      formData.append("AssetType", "CanvaUploadImage");
      formData.append("IsActive", "true");
      formData.append("IsDelete", "false");
      formData.append("FolderID", "0");

      await saveAssetsAction(formData);
      await loadImage();
      setUploading(false);
      target.value = null;
    };

    const handleSearch = (e) => {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);

      if (!query) {
        setFilteredImages(images);
      } else {
        const filtered = images.filter(
          (image) => image.assetName?.toLowerCase().includes(query) // 🔥 Search inside `assetName`
        );
        setFilteredImages(filtered);
      }
    };

    useEffect(() => {
      loadImage();
    }, []);

    return (
      <>
        <div
          style={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="input-file">
              <Button
                icon="upload"
                style={{ width: "100%" }}
                onClick={() => {
                  document.querySelector("#input-file")?.click();
                }}
                loading={isUploading}
              >
                Upload Files (.jpg, .jpeg, .png, .mp4, .mov )
              </Button>

              <input
                type="file"
                id="input-file"
                style={{ display: "none" }}
                onChange={handleFileInput}
                multiple
                accept=".jpg, .jpeg, .png, .mp4, .mov"
              />
            </label>

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              style={{
                background: "#1114184d",
                border: "none",
                boxShadow:
                  "0 0 0 0 #8ABBFF00, 0 0 0 0 #8ABBFF00,inset 0 0 0 1px #FFFFFF33,inset 0 -1px 1px 0 #FFFFFF4D",
                color: "#f6f7f9",
                fontSize: "14px",
                height: "30px",
                borderRadius: "30px",
                appearance: "none",
                outline: "none",
                padding: "0 10px 0 10px",
                width: "100%",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            />

            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ImagesGrid
                images={filteredImages}
                getPreview={(image) => image.assetFolderPath}
                isLoading={isLoading}
                onSelect={async (image, pos) => {
                  const { width, height } = await getImageSize(
                    image.assetFolderPath
                  );
                  store.activePage.addElement({
                    type: "image",
                    src: image.assetFolderPath,
                    width,
                    height,
                    x: pos ? pos.x : store.width / 2 - width / 2,
                    y: pos ? pos.y : store.height / 2 - height / 2,
                  });
                  sessionStorage.setItem("isSaveTemplate", true);
                }}
                rowsNumber={2}
                // isLoading={!images.length}
                loadMore={false}
              />

              {/* <ImagesGrid
                images={images}
                getPreview={(image) => image.url}
                crossOrigin="anonymous"
              onSelect={handleSelectImage}
              /> */}
            </div>
          </div>
        </div>
      </>
    );
  },
};

export default UploadPanel;
