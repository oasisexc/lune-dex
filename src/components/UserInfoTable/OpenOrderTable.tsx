import React, { useState } from 'react';

import styled from 'styled-components';
import { Button, Col, Row } from 'antd';
import { cancelOrder } from '../../utils/send';
import { useWallet } from '../../utils/wallet';
import { useSendConnection } from '../../utils/connection';
import { notify } from '../../utils/notifications';
import { OrderWithMarketAndMarketName } from '../../utils/types';

const CancelButton = styled(Button)`
  color: #262626;
  // border: 1px solid rgba(194, 0, 251, 0.1);
  border: 1px solid #c200fb;
  border-radius: 4px;
  width: 65px;
  height: 20px;
  font-size: 10;
  padding: 0;
  margin: 0;
`;

export default function OpenOrderTable({
  openOrders,
  onCancelSuccess,
  pageSize,
  loading,
  marketFilter,
  smallScreen,
}: {
  openOrders: OrderWithMarketAndMarketName[] | null | undefined;
  onCancelSuccess?: () => void;
  pageSize?: number;
  loading?: boolean;
  marketFilter?: boolean;
  smallScreen: boolean;
}) {
  let { wallet } = useWallet();
  let connection = useSendConnection();

  const [cancelId, setCancelId] = useState(null);

  async function cancel(order) {
    setCancelId(order?.orderId);
    try {
      if (wallet) {
        await cancelOrder({
          order,
          market: order.market,
          connection,
          wallet,
        });
      } else {
        throw Error('Error cancelling order');
      }
    } catch (e) {
      notify({
        message: 'Error cancelling order',
        description: e.message,
        type: 'error',
      });
      return;
    } finally {
      setCancelId(null);
    }
    onCancelSuccess && onCancelSuccess();
  }

  const dataSource = (openOrders || []).map((order) => ({
    ...order,
    key: order.orderId,
  }));

  return (
    <Row>
      <Col span={24}>
        <Row
          style={{
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.5)',
            paddingBottom: 16,
            textAlign: 'center',
          }}
        >
          <Col span={5}>마켓</Col>
          <Col span={5}>매수/매도</Col>
          <Col span={5}>수량</Col>
          <Col span={5}>가격</Col>
          <Col span={4}></Col>
        </Row>
        <div
          style={{
            height: smallScreen ? 230 : 330,
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          {dataSource.map(({ marketName, side, size, price, orderId }, i) => (
            <Row
              key={i}
              style={{
                fontSize: 12,
                color: 'rgba(241, 241, 242, 1)',
                paddingBottom: 16,
              }}
            >
              <Col span={5} style={{ textAlign: 'left' }}>
                {marketName}
              </Col>
              <Col
                span={5}
                style={{ textAlign: 'right', color: 'rgba(90, 196, 190, 1)' }}
              >
                {side}
              </Col>
              <Col
                span={5}
                style={{ textAlign: 'right', color: 'rgba(90, 196, 190, 1)' }}
              >
                {size}
              </Col>
              <Col span={5} style={{ textAlign: 'right' }}>
                {price}
              </Col>
              <Col span={4} style={{ textAlign: 'right' }}>
                <CancelButton
                  onClick={() => cancel(dataSource[i])}
                  loading={cancelId + '' === orderId + ''}
                >
                  취소
                </CancelButton>
              </Col>
            </Row>
          ))}
        </div>
        {/*<DataTable*/}
        {/*  emptyLabel="No open orders"*/}
        {/*  dataSource={dataSource}*/}
        {/*  columns={columns}*/}
        {/*  pagination={true}*/}
        {/*  pageSize={pageSize ? pageSize : 5}*/}
        {/*  loading={loading !== undefined && loading}*/}
        {/*/>*/}
      </Col>
    </Row>
  );
}
