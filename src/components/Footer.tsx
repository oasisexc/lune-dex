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
        <Link
          external
          to={helpUrls.developerResources}
          style={{ color: '#b1bac3', fontWeight: 'bold' }}
        >
          {'Serum Developer Resources'}
        </Link>
      </Row>
      <Row>
        <Col>
          <Link
            external
            to={helpUrls.discord}
            style={{ color: '#b1bac3', fontWeight: 'bold' }}
          >
            {'Discord'}
          </Link>
        </Col>
        <Col style={{ margin: '0 5px', color: '#b1bac3', fontWeight: 'bold' }}>
          {'|'}
        </Col>
        <Col>
          <Link
            external
            to={helpUrls.telegram}
            style={{ color: '#b1bac3', fontWeight: 'bold' }}
          >
            {'Telegram'}
          </Link>
        </Col>
        <Col style={{ margin: '0 5px', color: '#b1bac3', fontWeight: 'bold' }}>
          {'|'}
        </Col>
        <Col>
          <Link
            external
            to={helpUrls.github}
            style={{ color: '#b1bac3', fontWeight: 'bold' }}
          >
            {'GitHub'}
          </Link>
        </Col>
      </Row>
      <Row>{'Project Serum'}</Row>
      <Row>
        <Col span={12} style={{ textAlign: 'left' }}>
          <Link external to={helpUrls.solanaBeach} style={{ color: '#b1bac3' }}>
            {'Solana network'}
          </Link>
        </Col>
        <Col span={12} style={{ textAlign: 'right', color: '#b1bac3' }}>
          {'Copyright © lunedex, Inc. All rights reserved'}
        </Col>
      </Row>
    </Footer>
  );
};
