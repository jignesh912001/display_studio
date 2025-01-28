import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { InputGroup } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { getImageSize } from 'polotno/utils/image';
import { SectionTab } from 'polotno/side-panel';
import FaShapes from '@meronex/icons/fa/FaShapes';

const AsstesImage = {
    name: 'assetsImage',
    Tab: (props) => (
        <SectionTab name="Assets" {...props}>
            <FaShapes icon="new-text-box" />
        </SectionTab>
    ),
    Panel: ({ store }) => {
        const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjUiLCJ1bmlxdWVfbmFtZSI6ImhldGFsLnByYWphcGF0aUB0aGVkZXN0aW55c29sdXRpb25zLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N5c3RlbSI6IkluZGlhIFN0YW5kYXJkIFRpbWUiLCJuYmYiOjE3MjA2MDIxMjIsImV4cCI6MTcyMDg2MTMyMiwiaWF0IjoxNzIwNjAyMTIyfQ.NZBsXPjeLJzYSC0WwfBEDZHWGOSbiX5_kn26Gt87Dha_zerwjuUPJgN9S30ApKOayVumgKs3ib7-REWWhjbjcA"
        const [images, setImages] = React.useState([]);
        const [assetsType, setAssetsType] = useState('IMAGE');


        useEffect(() => {
            loadAssets();
        }, [assetsType]);

        async function loadAssets() {
            setImages([]); 
            const response = await axios.get(`https://back.disploy.com/api/AssetMaster/GetAssetDetails?ScreenType=${assetsType}&searchAsset=`, {
                headers: { Authorization: token },
            });
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

                {assetsType === 'IMAGE' &&
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
                }
               
            </div>
        );
    },
};

export default AsstesImage;
