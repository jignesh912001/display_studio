import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { InputGroup } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { getImageSize } from 'polotno/utils/image';
import { SectionTab } from 'polotno/side-panel';
import FaShapes from '@meronex/icons/fa/FaShapes';
import { getAssetsAction } from '../API/APICallingAll';

const AsstesImage = {
    name: 'assetsImage',
    Tab: (props) => (
        <SectionTab name="Images" {...props}>
            <FaShapes icon="new-text-box" />
        </SectionTab>
    ),
    Panel: ({ store }) => {
        
        const [images, setImages] = React.useState([]);

        useEffect(() => {
            loadAssets();
        }, []);

        async function loadAssets() {
            setImages([]);
            const response = await getAssetsAction({ assetsType: "IMAGE" })
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const data = response.data.data;
            setImages(data);
        }

        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <InputGroup
                    leftIcon="search"
                    placeholder="Search..."
                    onChange={(e) => loadAssets(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />

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
                    isLoading={!images.length}
                    loadMore={false}
                />
            </div>
        );
    },
};

export default AsstesImage;
