import { Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { useMarket, useRaydiumTrades } from '../utils/markets';
import { getDecimalCount } from '../utils/utils';
import FloatingElement from './layout/FloatingElement';
import { TradeLayout } from '../utils/types';

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;
const SizeTitle = styled(Row)`
  padding: 16px 0 12px;
  color: #434a59;
`;

export default function PublicTrades({ smallScreen }) {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const [trades, loaded] = useRaydiumTrades();

  return (
    <FloatingElement
      style={{
        ...(smallScreen
          ? { flex: 1 }
          : {
              // marginTop: '10px',
              height: '500px',
              width: '100%',
              padding: '0 16px',
            }),
      }}
    >
      <Title
        style={{
          color: '#21252a',
          fontWeight: 'bold',
          fontSize: 14,
          // borderBottom: '1px solid #1C274F',
          padding: '12px 0 12px 0',
        }}
      >
        시세
      </Title>
      <SizeTitle>
        <Col
          span={12}
          style={{
            textAlign: 'left',
            color: '#636c7d',
            fontSize: 12,
          }}
        >
          가격 ({quoteCurrency})
        </Col>
        {/* <Col
          span={8}
          style={{
            textAlign: 'right',
            paddingRight: 20,
            color: '#636c7d',
            fontSize: 12,
          }}
        >
          수량 ({baseCurrency})
        </Col> */}
        <Col
          span={12}
          style={{
            textAlign: 'right',
            color: '#636c7d',
            fontSize: 12,
          }}
        >
          체결시간
        </Col>
      </SizeTitle>
      {!!trades && loaded && (
        <div
          style={{
            marginRight: '-10px',
            paddingRight: '5px',
            overflowY: 'scroll',
            // maxHeight: smallScreen
            //   ? 'calc(100% - 75px)'
            //   : 'calc(100vh - 800px)',
            height: 390,
          }}
        >
          {trades.map((trade: TradeLayout, i: number) => (
            <Row key={i} style={{ marginBottom: 4 }}>
              <Col
                span={12}
                style={{
                  color: trade.side === 'buy' ? '#26a69a' : '#ef5350',
                  fontSize: 12,
                }}
              >
                {market?.tickSize && !isNaN(trade.price)
                  ? Number(trade.price).toFixed(
                      getDecimalCount(market.tickSize),
                    )
                  : trade.price}
              </Col>
              {/* <Col span={8} style={{ textAlign: 'right', fontSize: 12 }}>
                {market?.minOrderSize && !isNaN(trade.size)
                  ? Number(trade.size).toFixed(
                      getDecimalCount(market.minOrderSize),
                    )
                  : trade.size}
              </Col> */}
              <Col
                span={12}
                style={{
                  textAlign: 'right',
                  color: '#b1bac3',
                  fontSize: 12,
                  letterSpacing: -0.24,
                  fontWeight: 400,
                }}
              >
                {trade.time && new Date(trade.time).toLocaleTimeString()}
              </Col>
            </Row>
          ))}
        </div>
      )}
    </FloatingElement>
  );
}
