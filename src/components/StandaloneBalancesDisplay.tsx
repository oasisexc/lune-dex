import { Button, Col, Divider, Row } from 'antd';
import React, { useState } from 'react';
import FloatingElement from './layout/FloatingElement';
import styled from 'styled-components';
import {
  useBalances,
  useMarket,
  useSelectedBaseCurrencyAccount,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
  useTokenAccounts,
} from '../utils/markets';
import DepositDialog from './DepositDialog';
import { useWallet } from '../utils/wallet';
import { settleFunds } from '../utils/send';
import { useSendConnection } from '../utils/connection';
import { notify } from '../utils/notifications';
import { Balances } from '../utils/types';
import StandaloneTokenAccountsSelect from './StandaloneTokenAccountSelect';
// import logo1 from '../assets/logo1.svg';

const RowBox = styled(Row)`
  padding-bottom: 20px;
`;

const ActionButton = styled(Button)`
  color: '#000000';
  font-size: 12px;
  display: 'inline-block';
  padding-right: 15px;
  padding-left: 15px;
  border-radius: 4px;
  border: 1px solid rgba(241, 241, 242, 0.5);
`;

export default function StandaloneBalancesDisplay() {
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const balances = useBalances();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const connection = useSendConnection();
  const { wallet, connected } = useWallet();
  const [baseOrQuote, setBaseOrQuote] = useState('');
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const [tokenAccounts] = useTokenAccounts();
  const baseCurrencyBalances =
    balances && balances.find((b) => b.coin === baseCurrency);
  const quoteCurrencyBalances =
    balances && balances.find((b) => b.coin === quoteCurrency);

  async function onSettleFunds() {
    if (!wallet) {
      notify({
        message: 'Wallet not connected',
        description: 'wallet is undefined',
        type: 'error',
      });
      return;
    }

    if (!market) {
      notify({
        message: 'Error settling funds',
        description: 'market is undefined',
        type: 'error',
      });
      return;
    }
    if (!openOrdersAccount) {
      notify({
        message: 'Error settling funds',
        description: 'Open orders account is undefined',
        type: 'error',
      });
      return;
    }
    if (!baseCurrencyAccount) {
      notify({
        message: 'Error settling funds',
        description: 'Open orders account is undefined',
        type: 'error',
      });
      return;
    }
    if (!quoteCurrencyAccount) {
      notify({
        message: 'Error settling funds',
        description: 'Open orders account is undefined',
        type: 'error',
      });
      return;
    }

    try {
      await settleFunds({
        market,
        openOrders: openOrdersAccount,
        connection,
        wallet,
        baseCurrencyAccount,
        quoteCurrencyAccount,
      });
    } catch (e) {
      notify({
        message: 'Error settling funds',
        description: e.message,
        type: 'error',
      });
    }
  }

  const formattedBalances: [
    string | undefined,
    Balances | undefined,
    string,
    string | undefined,
  ][] = [
    [
      baseCurrency,
      baseCurrencyBalances,
      'base',
      market?.baseMintAddress.toBase58(),
    ],
    [
      quoteCurrency,
      quoteCurrencyBalances,
      'quote',
      market?.quoteMintAddress.toBase58(),
    ],
  ];
  return (
    <FloatingElement
      style={{ flex: 1, padding: 16, color: '#636c7d', fontSize: '14px' }}
    >
      <div
        style={{
          width: '100%',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#21252a',
        }}
      >
        나의 자산
      </div>
      <div>
        <Row
          style={{
            color: '#21252a',
            textAlign: 'right',
          }}
        ></Row>
        {formattedBalances.map(
          ([currency, balances, baseOrQuote, mint], index) => (
            <React.Fragment key={index}>
              <Row
                style={{
                  marginTop: 12,
                }}
              >
                <Col
                  span={5}
                  style={{
                    color: '#21252a',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {currency}
                </Col>
              </Row>
              <Row style={{ marginTop: 16 }}>
                <Col span={5}>{'지갑잔고'}</Col>
                <Col span={14} style={{ textAlign: 'right' }}>
                  {balances && balances.wallet}
                </Col>
                <Col span={5}></Col>
              </Row>
              <Row
                style={{
                  paddingTop: 16,
                }}
              >
                <Col span={5}>{'거래대기'}</Col>
                <Col span={14}>{balances && balances.unsettled}</Col>
                <Col span={5} style={{ textAlign: 'right' }}>
                  <ActionButton size="small" onClick={onSettleFunds}>
                    Settle
                  </ActionButton>
                </Col>
              </Row>
              {connected && (
                <RowBox align="middle" style={{ paddingTop: '10px' }}>
                  <StandaloneTokenAccountsSelect
                    accounts={tokenAccounts
                      ?.filter(
                        (account) => account.effectiveMint.toBase58() === mint,
                      )
                      .sort((a, b) =>
                        a.pubkey.toString() === wallet?.publicKey.toString()
                          ? -1
                          : 1,
                      )}
                    mint={mint}
                    label
                  />
                </RowBox>
              )}
              {index === 0 ? (
                <Divider style={{ margin: '16px 0 10px' }} />
              ) : null}
            </React.Fragment>
          ),
        )}
      </div>
      <DepositDialog
        baseOrQuote={baseOrQuote}
        onClose={() => setBaseOrQuote('')}
      />
    </FloatingElement>
  );
}
