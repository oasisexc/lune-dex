import { Button, Col, Input, Row, Slider, Switch, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  useFeeDiscountKeys,
  useLocallyStoredFeeDiscountKey,
  useMarkPrice,
  useMarket,
  useSelectedBaseCurrencyAccount,
  useSelectedBaseCurrencyBalances,
  useSelectedOpenOrdersAccount,
  useSelectedQuoteCurrencyAccount,
  useSelectedQuoteCurrencyBalances,
} from '../utils/markets';

import FloatingElement from './layout/FloatingElement';
import { SwitchChangeEventHandler } from 'antd/es/switch';
import { notify } from '../utils/notifications';
import { refreshCache } from '../utils/fetch-loop';
import styled from 'styled-components';
import tuple from 'immutable-tuple';
import { useSendConnection } from '../utils/connection';
import { useWallet } from '../utils/wallet';
import {
  floorToDecimal,
  getDecimalCount,
  roundToDecimal,
} from '../utils/utils';
import { getUnixTs, placeOrder } from '../utils/send';

const BuyButton = styled(Button)`
  margin: 20px 0px 0px 0px;
  background: #02bf76;
  border-color: #02bf76;
`;

const sliderMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%',
};

export default function TradeForm({
  style,
  setChangeOrderRef,
  smallScreen,
}: {
  style?: any;
  smallScreen: boolean;
  setChangeOrderRef?: (
    ref: ({ size, price }: { size?: number; price?: number }) => void,
  ) => void;
}) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const { baseCurrency, quoteCurrency, market } = useMarket();
  const baseCurrencyBalances = useSelectedBaseCurrencyBalances();
  const quoteCurrencyBalances = useSelectedQuoteCurrencyBalances();
  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);
  const { wallet, connected, connect } = useWallet();
  const sendConnection = useSendConnection();
  const markPrice = useMarkPrice();
  useFeeDiscountKeys();
  const { storedFeeDiscountKey: feeDiscountKey } =
    useLocallyStoredFeeDiscountKey();

  const [postOnly, setPostOnly] = useState(false);
  const [ioc, setIoc] = useState(false);
  const [baseSize, setBaseSize] = useState<number | undefined>(undefined);
  const [quoteSize, setQuoteSize] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [sizeFraction, setSizeFraction] = useState(0);

  const [orderType, setOrderType] = useState('limit');

  const selectOrderType = (e) => {
    setOrderType(e.target.value);
  };

  const availableQuote =
    openOrdersAccount && market
      ? market.quoteSplSizeToNumber(openOrdersAccount.quoteTokenFree)
      : 0;

  let quoteBalance = (quoteCurrencyBalances || 0) + (availableQuote || 0);
  let baseBalance = baseCurrencyBalances || 0;
  let sizeDecimalCount =
    market?.minOrderSize && getDecimalCount(market.minOrderSize);
  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  useEffect(() => {
    setChangeOrderRef && setChangeOrderRef(doChangeOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChangeOrderRef]);

  useEffect(() => {
    baseSize && price && onSliderChange(sizeFraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);

  useEffect(() => {
    updateSizeFraction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, baseSize]);

  const walletPubkey = wallet?.publicKey;
  useEffect(() => {
    const warmUpCache = async () => {
      try {
        if (!wallet || !wallet.publicKey || !market) {
          console.log(`Skipping refreshing accounts`);
          return;
        }
        const startTime = getUnixTs();
        console.log(`Refreshing accounts for ${market.address}`);
        await market?.findOpenOrdersAccountsForOwner(
          sendConnection,
          wallet.publicKey,
        );
        await market?.findBestFeeDiscountKey(sendConnection, wallet.publicKey);
        const endTime = getUnixTs();
        console.log(
          `Finished refreshing accounts for ${market.address} after ${
            endTime - startTime
          }`,
        );
      } catch (e) {
        console.log(`Encountered error when refreshing trading accounts: ${e}`);
      }
    };
    warmUpCache();
    const id = setInterval(warmUpCache, 30_000);
    return () => clearInterval(id);
  }, [market, sendConnection, wallet, walletPubkey]);

  // useInterval(() => {
  //   const autoSettle = async () => {
  //     if (!wallet || !market || !openOrdersAccount || !baseCurrencyAccount || !quoteCurrencyAccount ||
  //       openOrdersAccount?.baseTokenFree.toNumber() <= 0 || openOrdersAccount.quoteTokenFree.toNumber() <= 0) {
  //       return;
  //     }
  //     try {
  //       // settle funds into selected token wallets
  //       await settleFunds({
  //         market,
  //         openOrders: openOrdersAccount,
  //         connection: sendConnection,
  //         wallet,
  //         baseCurrencyAccount,
  //         quoteCurrencyAccount
  //       });
  //     } catch (e) {
  //       console.log('Error auto settling funds: ' + e.message);
  //     }
  //   };
  //   (
  //     connected &&
  //     wallet?.autoApprove &&
  //     autoSettleEnabled &&
  //     autoSettle()
  //   );
  // }, 10000);

  const onSetBaseSize = (baseSize: number | undefined) => {
    setBaseSize(baseSize);
    if (!baseSize) {
      setQuoteSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setQuoteSize(undefined);
      return;
    }
    const rawQuoteSize = baseSize * usePrice;
    const quoteSize =
      baseSize && roundToDecimal(rawQuoteSize, sizeDecimalCount);
    setQuoteSize(quoteSize);
  };

  const onSetQuoteSize = (quoteSize: number | undefined) => {
    setQuoteSize(quoteSize);
    if (!quoteSize) {
      setBaseSize(undefined);
      return;
    }
    let usePrice = price || markPrice;
    if (!usePrice) {
      setBaseSize(undefined);
      return;
    }
    const rawBaseSize = quoteSize / usePrice;
    const baseSize = quoteSize && roundToDecimal(rawBaseSize, sizeDecimalCount);
    setBaseSize(baseSize);
  };

  const doChangeOrder = ({
    size,
    price,
  }: {
    size?: number;
    price?: number;
  }) => {
    const formattedSize = size && roundToDecimal(size, sizeDecimalCount);
    const formattedPrice = price && roundToDecimal(price, priceDecimalCount);
    formattedSize && onSetBaseSize(formattedSize);
    formattedPrice && setPrice(formattedPrice);
  };

  const updateSizeFraction = () => {
    const rawMaxSize =
      side === 'buy' ? quoteBalance / (price || markPrice || 1) : baseBalance;
    const maxSize = floorToDecimal(rawMaxSize, sizeDecimalCount);
    const sizeFraction = Math.min(((baseSize || 0) / maxSize) * 100, 100);
    setSizeFraction(sizeFraction);
  };

  const onSliderChange = (value) => {
    if (!price && markPrice) {
      let formattedMarkPrice: number | string = priceDecimalCount
        ? markPrice.toFixed(priceDecimalCount)
        : markPrice;
      setPrice(
        typeof formattedMarkPrice === 'number'
          ? formattedMarkPrice
          : parseFloat(formattedMarkPrice),
      );
    }

    let newSize;
    if (side === 'buy') {
      if (price || markPrice) {
        newSize = ((quoteBalance / (price || markPrice || 1)) * value) / 100;
      }
    } else {
      newSize = (baseBalance * value) / 100;
    }

    // round down to minOrderSize increment
    let formatted = floorToDecimal(newSize, sizeDecimalCount);

    onSetBaseSize(formatted);
  };

  const postOnChange: SwitchChangeEventHandler = (checked) => {
    if (checked) {
      setIoc(false);
    }
    setPostOnly(checked);
  };
  const iocOnChange: SwitchChangeEventHandler = (checked) => {
    if (checked) {
      setPostOnly(false);
    }
    setIoc(checked);
  };

  async function onSubmit() {
    if (!price) {
      console.warn('Missing price');
      notify({
        message: 'Missing price',
        type: 'error',
      });
      return;
    } else if (!baseSize) {
      console.warn('Missing size');
      notify({
        message: 'Missing size',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (wallet) {
        await placeOrder({
          side,
          price,
          size: baseSize,
          orderType: ioc ? 'ioc' : postOnly ? 'postOnly' : 'limit',
          market,
          connection: sendConnection,
          wallet,
          baseCurrencyAccount: baseCurrencyAccount?.pubkey,
          quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
          feeDiscountPubkey: feeDiscountKey,
        });
        refreshCache(tuple('getTokenAccounts', wallet, connected));
        setPrice(undefined);
        onSetBaseSize(undefined);
      } else {
        throw Error('Error placing order');
      }
    } catch (e) {
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }

  // @ts-ignore
  return (
    <FloatingElement
      style={{ display: 'flex', flexDirection: 'column', ...style }}
    >
      <div style={{ flex: 1 }}>
        <Row>
          <Col
            span={12}
            onClick={() => setSide('buy')}
            style={{
              height: 42,
              width: '50%',
              textAlign: 'center',
              border: 'transparent',
              borderBottom:
                side === 'buy' ? '2px solid #26a69a' : '2px solid #ffffff',
              background: 'transparent',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 600,
              color: side === 'buy' ? '#26a69a' : '#636c7d',
              padding: '12px 0 0 0',
              cursor: 'pointer',
            }}
          >
            매수
          </Col>
          <Col
            span={12}
            onClick={() => setSide('sell')}
            style={{
              height: 42,
              width: '50%',
              textAlign: 'center',
              border: 'transparent',
              borderBottom:
                side === 'sell' ? '2px solid #ef5350' : '2px solid #ffffff',
              background: 'transparent',
              fontSize: 14,
              fontStyle: 'normal',
              fontWeight: 600,
              color: side === 'sell' ? '#ef5350' : '#636c7d',
              padding: '12px 0 0 0',
              cursor: 'pointer',
            }}
          >
            매도
          </Col>
        </Row>
        <div
          style={{
            padding: '14px 16px 16px',
          }}
        >
          <Radio.Group
            onChange={selectOrderType}
            value={orderType}
            style={{ display: 'flex' }}
          >
            <Radio
              value={'limit'}
              style={{ fontSize: smallScreen ? '12px' : '13px' }}
            >
              지정가
            </Radio>
            <Radio
              value={'market'}
              disabled={true}
              style={{ fontSize: smallScreen ? '12px' : '13px' }}
            >
              시장가
            </Radio>
          </Radio.Group>
          <div style={{ marginTop: smallScreen ? 4 : 14 }}>
            <div
              style={{
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 'bold',
                color: '#21252a',
                lineHeight: '24px',
              }}
            >
              가격
            </div>
            <Input
              type="number"
              bordered={false}
              style={{
                textAlign: 'right',
                height: smallScreen ? 35 : 48,
                background: '#ffffff',
                border: '1px solid #f1f3f5',
                borderRadius: 4,
              }}
              suffix={
                <span style={{ fontSize: 10, opacity: 0.5 }}>
                  {quoteCurrency}
                </span>
              }
              value={price}
              step={market?.tickSize || 1}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ marginTop: smallScreen ? 4 : 14 }}>
            <div
              style={{
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 'bold',
                color: '#21252a',
                lineHeight: '24px',
              }}
            >
              수량
            </div>
            <Input
              type="number"
              bordered={false}
              style={{
                textAlign: 'right',
                paddingBottom: 8,
                height: smallScreen ? 35 : 48,
                background: '#ffffff',
                border: '1px solid #f1f3f5',
                borderRadius: 4,
              }}
              suffix={
                <span style={{ fontSize: 10, opacity: 0.5 }}>
                  {baseCurrency}
                </span>
              }
              value={baseSize}
              step={market?.tickSize || 1}
              onChange={(e) => onSetBaseSize(parseFloat(e.target.value))}
            />
          </div>
          <SliderWrapper smallScreen={smallScreen}>
            <Slider
              style={{
                width: '90%',
                margin: smallScreen ? '6px auto 0' : '14px auto',
                height: '34px',
              }}
              value={sizeFraction}
              tipFormatter={(value) => `${value}%`}
              marks={sliderMarks}
              onChange={onSliderChange}
            />
          </SliderWrapper>
          <div style={{ marginTop: smallScreen ? 0 : 14 }}>
            <div
              style={{
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 'bold',
                color: '#21252a',
                lineHeight: '24px',
              }}
            >
              총 금액
            </div>
            <Input
              type="number"
              bordered={false}
              style={{
                textAlign: 'right',
                paddingBottom: 8,
                height: smallScreen ? 35 : 48,
                background: '#ffffff',
                border: '1px solid #f1f3f5',
                borderRadius: 4,
              }}
              suffix={
                <span style={{ fontSize: 10, opacity: 0.5 }}>
                  {quoteCurrency}
                </span>
              }
              value={quoteSize}
              step={market?.tickSize || 1}
              onChange={(e) => onSetQuoteSize(parseFloat(e.target.value))}
            />
          </div>

          <Row
            style={{
              paddingTop: smallScreen ? 0 : 8,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Col
              style={{
                paddingTop: smallScreen ? 4 : 10,
                paddingLeft: smallScreen ? 0 : 10,
              }}
            >
              <Switch
                checked={postOnly}
                size={smallScreen ? 'small' : 'default'}
                style={{ width: 32 }}
                onChange={postOnChange}
              />
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  color: '#BEBEBE',
                  paddingLeft: 4,
                }}
              >
                POST
              </div>
            </Col>
            <Col
              style={{
                paddingTop: smallScreen ? 4 : 10,
                paddingLeft: smallScreen ? 4 : 10,
              }}
            >
              <Switch
                checked={ioc}
                size={smallScreen ? 'small' : 'default'}
                style={{ width: 32 }}
                onChange={iocOnChange}
              />
              <div
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  color: '#BEBEBE',
                  paddingLeft: 4,
                }}
              >
                IOC
              </div>
            </Col>
          </Row>

          <BuyButton
            disabled={!price || !baseSize || !connected}
            onClick={onsubmit}
            block
            type="primary"
            size="large"
            loading={submitting}
            style={{
              marginTop: smallScreen ? 10 : 20,
              height: smallScreen ? 40 : 48,
              background: !connected
                ? '#dedee2'
                : side === 'buy'
                ? '#26a69a'
                : '#ef5350',
              // border: '1px solid #5AC4BE',
              color: !connected ? '#b1bac3' : '#ffffff',
              border: 'none',
              borderRadius: 4,
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {/* LIMIT {side.toUpperCase()} {baseCurrency} */}
            {!connected
              ? '지갑을 연결해주세요'
              : side === 'buy'
              ? '매수하기'
              : '매도하기'}
          </BuyButton>
        </div>
      </div>
    </FloatingElement>
  );
}

const SliderWrapper = styled.div`
  .ant-slider-mark-text {
    font-size: ${(props) => (props.smallScreen ? '10px' : '14px')};
  }
`;
