import React from 'react';
import { Row, Col } from 'antd';
import { useFills, useMarket } from '../../utils/markets';

export default function FillsTable({ smallScreen }) {
  const fills = useFills();

  const { quoteCurrency } = useMarket();

  const dataSource = (fills || []).map((fill) => ({
    ...fill,
    key: `${fill.orderId}${fill.side}`,
    liquidity: fill.eventFlags.maker ? 'Maker' : 'Taker',
  }));

  return (
    <>
      <Row>
        <Col span={24}>
          <Row
            style={{
              fontSize: 12,
              color: '#636c7d',
              paddingBottom: 16,
              textAlign: 'center',
            }}
          >
            <Col span={4}>마켓</Col>
            <Col span={4}>매수/매도</Col>
            <Col span={4}>수량</Col>
            <Col span={4}>가격</Col>
            <Col span={4}>유동성</Col>
            <Col span={4}>
              {quoteCurrency ? `수수료 (${quoteCurrency})` : '수수료'}
            </Col>
          </Row>
          <div
            style={{
              height: smallScreen ? 230 : 330,
              overflowX: 'hidden',
              overflowY: 'auto',
            }}
          >
            {dataSource.map(
              ({ marketName, side, size, price, liquidity, feeCost }, i) => (
                <Row
                  key={i}
                  style={{
                    fontSize: 14,
                    color: 'rgba(241, 241, 242, 1)',
                    paddingBottom: 16,
                  }}
                >
                  <Col span={4} style={{ textAlign: 'left' }}>
                    {marketName}
                  </Col>
                  <Col
                    span={4}
                    style={{
                      textAlign: 'right',
                      color: 'rgba(90, 196, 190, 1)',
                    }}
                  >
                    {side}
                  </Col>
                  <Col
                    span={4}
                    style={{
                      textAlign: 'right',
                      color: 'rgba(90, 196, 190, 1)',
                    }}
                  >
                    {size}
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    {price}
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    {liquidity}
                  </Col>
                  <Col span={4} style={{ textAlign: 'right' }}>
                    {feeCost}
                  </Col>
                </Row>
              ),
            )}
          </div>
          {/*<DataTable*/}
          {/*  dataSource={dataSource}*/}
          {/*  columns={columns}*/}
          {/*  pagination={true}*/}
          {/*  pageSize={5}*/}
          {/*  emptyLabel="No fills"*/}
          {/*/>*/}
        </Col>
      </Row>
    </>
  );
}
