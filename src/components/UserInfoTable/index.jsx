import BalancesTable from './BalancesTable';
import OpenOrderTable from './OpenOrderTable';
import React, { useState } from 'react';
import { Col, Row } from 'antd';
import FillsTable from './FillsTable';
import FloatingElement from '../layout/FloatingElement';
import FeesTable from './FeesTable';
import { useOpenOrders, useBalances, useMarket } from '../../utils/markets';

export default function Index({ smallScreen }) {
  const { market } = useMarket();
  const marketAddress = market?.address.toString();
  const [activeKeyStr, setActiveKeyStr] = useState('orders');

  return (
    <FloatingElement style={{ flex: 1, paddingTop: 4 }}>
      <Row>
        <Col
          // span={24 / (market && market.supportsSrmFeeDiscounts ? 4 : 3)}
          onClick={() => setActiveKeyStr('orders')}
          style={{
            height: 42,
            width: '50%',
            textAlign: 'center',
            border: 'transparent',
            borderBottom: activeKeyStr === 'orders' ? '2px solid #343847' : '',
            background: 'transparent',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 600,
            color: activeKeyStr === 'orders' ? '#343847' : '#636c7d',
            padding: '12px 0 12px',
            cursor: 'pointer',
          }}
        >
          미체결
        </Col>
        <Col
          // span={24 / (market && market.supportsSrmFeeDiscounts ? 4 : 3)}
          onClick={() => setActiveKeyStr('fills')}
          style={{
            height: 42,
            width: '50%',
            textAlign: 'center',
            border: 'transparent',
            borderBottom: activeKeyStr === 'fills' ? '2px solid #343847' : '',
            background: 'transparent',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 600,
            color: activeKeyStr === 'fills' ? '#343847' : '#636c7d',
            padding: '12px 0 12px',
            cursor: 'pointer',
          }}
        >
          거래내역
        </Col>
        {/* <Col
            span={24 / (market && market.supportsSrmFeeDiscounts ? 4 : 3)}
            onClick={() => setActiveKeyStr('balances')}
            style={{
              height: 42,
              width: '50%',
              textAlign: 'center',
              border: 'transparent',
              borderBottom:
                activeKeyStr === 'balances' ? '2px solid #343847' : '',
              background: 'transparent',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 600,
              color: activeKeyStr === 'balances' ? '#343847' : '#636c7d',
              padding: '12px 0 12px',
              cursor: 'pointer',
            }}
          >
            Balances
          </Col> */}
        {/* {market && market.supportsSrmFeeDiscounts ? (
            <Col
              span={24 / (market && market.supportsSrmFeeDiscounts ? 4 : 3)}
              onClick={() => setActiveKeyStr('fees')}
              style={{
                height: 42,
                width: '50%',
                textAlign: 'center',
                border: 'transparent',
                borderBottom:
                  activeKeyStr === 'fees' ? '2px solid #343847' : '',
                background: 'transparent',
                fontSize: 14,
                fontStyle: 'normal',
                fontWeight: 600,
                color: activeKeyStr === 'fees' ? '#343847' : '#636c7d',
                padding: '12px 0 12px',
                cursor: 'pointer',
              }}
            >
              Fee Discounts
            </Col>
          ) : null} */}
      </Row>
      <div
        style={{
          height: 400,
          borderBottom: '',
          padding: 16,
        }}
      >
        {activeKeyStr && activeKeyStr === 'orders' ? <OpenOrdersTab /> : null}
        {activeKeyStr && activeKeyStr === 'fills' ? <FillsTable /> : null}
        {/* {activeKeyStr && activeKeyStr === 'balances' ? <BalancesTab /> : null} */}
        {/* {activeKeyStr && activeKeyStr === 'fees' ? (
            <FeesTable market={{ marketAddress }} />
          ) : null} */}
      </div>
    </FloatingElement>
  );
}

const OpenOrdersTab = () => {
  const openOrders = useOpenOrders();

  return <OpenOrderTable openOrders={openOrders} />;
};

const BalancesTab = () => {
  const balances = useBalances();

  return <BalancesTable balances={balances} />;
};
