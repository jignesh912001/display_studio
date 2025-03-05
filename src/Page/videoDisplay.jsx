import React from 'react';
import { Spinner } from '@blueprintjs/core';
import { getImageSize } from 'polotno/utils/image';

export const VideoGrid = ({ videos, onSelect, isLoading }) => {
    if (isLoading) {
        return <Spinner />;
    }

    if (!videos?.length) {
        return <p>No videos found.</p>;
    }

    return (

        <div
            style={{
                height: '100%',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#f9f9f9',
            }}
        >
            {videos?.map((video, index) => (
                <div
                    key={index}
                    onClick={async (e) => {
                        const { width, height } = await (video.assetFolderPath);
                        onSelect(video, {
                            x: e.nativeEvent.offsetX,
                            y: e.nativeEvent.offsetY,
                            width,
                            height,
                        });
                    }}
                    style={{
                        cursor: 'pointer',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        background: '#fff',
                    }}
                >
                    <video
                        src={video.assetFolderPath}
                        style={{ width: '100%', height: '100px' }}
                        controls={false}
                    />
                    {/* <p style={{ fontSize: '12px', marginTop: '8px' }}>{video.assetName}</p> */}
                </div>
            ))}
        </div>

    );
};
