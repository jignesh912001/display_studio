import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { ImagesGrid, SectionTab } from 'polotno/side-panel';
import FaCloudUploadAlt from '@meronex/icons/fa/FaCloudUploadAlt';
import { getImages, saveImage } from '../API/UploadImage';
import { getImageSize } from 'polotno/utils/image';



const UploadPanel = {
  name: 'uploaad',
  Tab: (props) => (
    <SectionTab name="Uploaad" {...props}>
      <FaCloudUploadAlt icon="new-text-box" />
    </SectionTab>
  ),
  Panel: ({ store }) => {

    const [images, setImages] = React.useState([]);
    const [isUploading, setUploading] = React.useState(false);

    useEffect(() => {
      loadImage()
    }, [])

    const loadImage = async () => {
      const images = await getImages();
      setImages(images);
    };

    const handleFileInput = async (e) => {
      const { target } = e;
      setUploading(true);
      for (const file of target.files) {
        await saveImage(file);
      }
      await loadImage();
      setUploading(false);
      target.value = null;
    };


    const handleSelectImage = async (image, pos, element) => {
      const { url } = image;
      let { width, height } = await getImageSize(url);
      const isSVG = url.indexOf('svg+xml') >= 0 || url.indexOf('.svg') >= 0;
      const type = isSVG ? 'svg' : 'image';

      if (element) {
        if (!element.locked) {
          if (element.type === 'image' && type === 'image') {
            element.set({ src: url });
          } else if (element.type === 'svg' && type === 'image') {
            element.set({ maskSrc: url });
          }
        }
        return;
      }

      // Calculate appropriate scaling for the new image or svg
      const scale = Math.min(store.width / width, store.height / height, 1);
      width = width * scale;
      height = height * scale;

      const x = (pos?.x || store.width / 2) - width / 2;
      const y = (pos?.y || store.height / 2) - height / 2;

      // Add new element to the canvas
      store.activePage?.addElement({
        type,
        src: url,
        x,
        y,
        width,
        height,
      });
    };

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
                Upload Image (use small image)
              </Button>
              <input
                type="file"
                id="input-file"
                style={{ display: 'none' }}
                onChange={handleFileInput}
                multiple
              />
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              <ImagesGrid
                images={images}
                getPreview={(image) => image.url}
                crossOrigin="anonymous"
                onSelect={handleSelectImage}
              />
            </div>
          </div>
        </div>
      </>
    )
  }
}


export default UploadPanel;
