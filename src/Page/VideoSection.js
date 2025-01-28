import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { InputGroup } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { VideoGrid } from './videoDisplay'; // VideoGrid component
import BsCameraVideoFill from '@meronex/icons/bs/BsCameraVideoFill';
import { getImageSize } from 'polotno/utils/image';

const VideoSection = {
    name: 'video',
    Tab: (props) => (
        <SectionTab name="Video" {...props}>
            <BsCameraVideoFill icon="new-text-box" />
        </SectionTab>
    ),
    Panel: ({ store }) => {
        const token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjUiLCJ1bmlxdWVfbmFtZSI6ImhldGFsLnByYWphcGF0aUB0aGVkZXN0aW55c29sdXRpb25zLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N5c3RlbSI6IkluZGlhIFN0YW5kYXJkIFRpbWUiLCJuYmYiOjE3MjA2MDIxMjIsImV4cCI6MTcyMDg2MTMyMiwiaWF0IjoxNzIwNjAyMTIyfQ.NZBsXPjeLJzYSC0WwfBEDZHWGOSbiX5_kn26Gt87Dha_zerwjuUPJgN9S30ApKOayVumgKs3ib7-REWWhjbjcA"; // Replace with your actual token
        const [videos, setVideos] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            loadVideos();
        }, [searchTerm]);

        async function loadVideos() {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `https://back.disploy.com/api/AssetMaster/GetAssetDetails?ScreenType=VIDEO&searchAsset=${searchTerm}`,
                    { headers: { Authorization: token } }
                );
                const data = response.data.data;
                setVideos(data);
            } catch (error) {
                console.error("Error loading videos:", error);
            } finally {
                setIsLoading(false);
            }
        }

        const addVideoToCanvas = (video) => {
            const videoElement = document.createElement('video');
            videoElement.src = video.assetFolderPath;
            videoElement.onloadedmetadata = () => {
                const width = videoElement.videoWidth;
                const height = videoElement.videoHeight;
                store.activePage.addElement({
                    type: 'video',
                    src: video.assetFolderPath,
                    width,
                    height,
                    x: store.width / 2 - width / 2,
                    y: store.height / 2 - height / 2,
                });
            };
        };

        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <InputGroup
                    leftIcon="search"
                    placeholder="Search videos..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginBottom: '20px' }}
                />

                <VideoGrid
                    videos={videos}
                    onSelect={addVideoToCanvas}
                    isLoading={isLoading}
                />
            </div>
        );
    },
};

export default VideoSection;
