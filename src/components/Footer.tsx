import React from 'react';
import { Layout, Row, Col, Grid } from 'antd';
import Link from './Link';
import { helpUrls } from './HelpUrls';
const { Footer } = Layout;
const { useBreakpoint } = Grid;

// const footerElements = [
//   {
//     description: 'Serum Developer Resources',
//     link: helpUrls.developerResources,
//   },
//   { description: 'Discord', link: helpUrls.discord },
//   { description: 'Telegram', link: helpUrls.telegram },
//   { description: 'GitHub', link: helpUrls.github },
//   { description: 'Solana Network', link: helpUrls.solanaBeach },
// ];

export const CustomFooter = () => {
  const smallScreen = !useBreakpoint().lg;

  return (
    <Footer
      style={{
        padding: smallScreen ? '20px' : '20px 95px 40px 95px',
        background: '#f8f9fa',
        color: '#b1bac3',
      }}
    >
      <Row>
        <Col span={24} style={{ textAlign: 'right', color: '#b1bac3' }}>
          {'Copyright © lunedex, Inc. All rights reserved'}
        </Col>
      </Row>
    </Footer>
  );
};
