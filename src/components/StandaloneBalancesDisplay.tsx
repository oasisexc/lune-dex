import { Button, Col, Divider, Row, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
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
import { InfoCircleOutlined } from '@ant-design/icons';
// import logo1 from '../assets/logo1.svg';

// const RowBox = styled(Row)`
//   padding-bottom: 20px;
// `;

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
  const { wallet, connected, connect } = useWallet();
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
      {!connected ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: 150,
            padding: 16,
          }}
        >
          <p style={{ color: '#636c7d', margin: '4px' }}>지갑을 연결해주세요</p>
          <Button
            onClick={connect}
            block
            type="primary"
            size="large"
            style={{
              marginTop: window.innerWidth < 1000 ? 10 : 20,
              height: window.innerWidth < 1000 ? 40 : 48,
              background: '#343847',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: '14px',
              fontWeight: 'bold',
              width: '180px',
            }}
          >
            지갑 연결하기
          </Button>
        </div>
      ) : (
        <>
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
                      span={4}
                      style={{
                        color: '#21252a',
                        textAlign: 'left',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        lineHeight: '32px',
                      }}
                    >
                      {currency}
                    </Col>
                    {connected && (
                      <StandaloneTokenAccountsSelect
                        accounts={tokenAccounts
                          ?.filter(
                            (account) =>
                              account.effectiveMint.toBase58() === mint,
                          )
                          .sort((a, b) =>
                            a.pubkey.toString() === wallet?.publicKey.toString()
                              ? -1
                              : 1,
                          )}
                        mint={mint}
                        label
                      />
                    )}
                  </Row>
                  <Row style={{ marginTop: 20 }}>
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
                    <Col span={7}>
                      {'정산대기'}{' '}
                      <Popover
                        content={
                          <div style={{ margin: 0, padding: '5px' }}>
                            <p
                              style={{
                                lineHeight: '14px',
                                padding: '0 0 8px 0 ',
                                margin: 0,
                              }}
                            >
                              DEX와 상호작용하는 중개지갑에 있는 자산입니다.{' '}
                            </p>
                            <p
                              style={{
                                lineHeight: '14px',
                                padding: '0 0 8px 0 ',
                                margin: 0,
                              }}
                            >
                              주문이 완료되거나 취소되면 정산대기 금액에
                              표시됩니다.
                            </p>
                            <p
                              style={{
                                lineHeight: '14px',
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              우측 정산버튼을 통해 연결된 본인 소유 지갑으로
                              자산을 보내야합니다.
                            </p>
                          </div>
                        }
                        placement="bottomRight"
                        trigger="hover"
                      >
                        <InfoCircleOutlined
                          style={{ color: '#2abdd2', marginRight: '10px' }}
                        />
                      </Popover>
                    </Col>

                    <Col span={12}>{balances && balances.unsettled}</Col>
                    <Col span={5} style={{ textAlign: 'right' }}>
                      <Popover
                        content={
                          '정산대기 중인 자산을 연결된 본인 소유 지갑으로 보냅니다.'
                        }
                        placement="bottomRight"
                        trigger="hover"
                      >
                        <ActionButton size="small" onClick={onSettleFunds}>
                          정산
                        </ActionButton>
                      </Popover>
                    </Col>
                  </Row>
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
        </>
      )}
    </FloatingElement>
  );
}
