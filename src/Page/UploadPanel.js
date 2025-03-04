import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { ImagesGrid, SectionTab } from 'polotno/side-panel';
import FaCloudUploadAlt from '@meronex/icons/fa/FaCloudUploadAlt';
import { getImages, saveImage } from '../API/UploadImage';
import { getAssetsAction, saveAssetsAction } from '../API/APICallingAll';
import { getImageSize } from 'polotno/utils/image';


const UploadPanel = {
  name: 'uploaad',
  Tab: (props) => (
    <SectionTab name="Upload" {...props}>
      <FaCloudUploadAlt icon="new-text-box" />
    </SectionTab>
  ),
  Panel: ({ store }) => {

    const [images, setImages] = useState([]);
    const [isUploading, setUploading] = useState(false);


    const loadImage = async () => {
      const response = await getAssetsAction({ assetsType: "CanvaUploadImage" })
      console.log('response', response)
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const data = response.data.data;
      setImages(data);
    };

    const handleFileInput = async (e) => {
      const { target } = e;
      const files = e.target.files;
      setUploading(true);
      const formData = new FormData();
      Array.from(files).forEach((file) => { formData.append('File', file) });
      formData.append("Operation", "Insert");
      formData.append("AssetType", "CanvaUploadImage");
      formData.append("IsActive", "true");
      formData.append("IsDelete", "false");
      formData.append("FolderID", "0");

      await saveAssetsAction(formData)
      await loadImage();
      setUploading(false);
      target.value = null;
    };

    useEffect(() => {
      loadImage()
    }, [])

    return (
      <>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="input-file">
              <Button
                icon="upload"
                style={{ width: '100%' }}
                onClick={() => { document.querySelector('#input-file')?.click() }}
                loading={isUploading}
              >
                Upload Image ( Add File )
              </Button>

              <input
                type="file"
                id="input-file"
                style={{ display: 'none' }}
                onChange={handleFileInput}
                multiple
              />
            </label>

            <div style={{ height: '920px', display: 'flex', flexDirection: 'column' }}>

              <ImagesGrid
                images={images}
                getPreview={(image) => image.assetFolderPath}
                onSelect={async (image, pos) => {
                  const { width, height } = await getImageSize(image.assetFolderPath);
                  store.activePage.addElement({
                    type: 'image',
                    src: image.assetFolderPath,
                    width,
                    height,
                    x: pos ? pos.x : store.width / 2 - width / 2,
                    y: pos ? pos.y : store.height / 2 - height / 2,
                  });
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
    )
  }
}


export default UploadPanel;
