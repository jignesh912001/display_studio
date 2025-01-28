// CustomTextSection.js
import React, { useEffect, useState } from 'react';
import { Button } from '@blueprintjs/core';
import axios from 'axios';
import { SectionTab } from 'polotno/side-panel';
import FaPen from '@meronex/icons/fa/FaPen';

const CustomTextSection = {
    name: 'font',
    Tab: (props) => (
        <SectionTab name="font" {...props}>
            <FaPen icon="new-text-box" />
        </SectionTab>
    ),
    Panel: ({ store }) => {
        const [fonts, setFonts] = useState([]);

        return (
            <div>
                <h3>Custom Fonts</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                 
                </div>
            </div>
        );

    }
};

export default CustomTextSection;
