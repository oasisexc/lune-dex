import { Button, Col, Popover, Row, Select, Typography } from 'antd';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  MarketProvider,
  getMarketInfos,
  getTradePageUrl,
  useMarket,
  useMarketsList,
  useUnmigratedDeprecatedMarkets,
} from '../utils/markets';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import CustomMarketDialog from '../components/CustomMarketDialog';
import DeprecatedMarketsInstructions from '../components/DeprecatedMarketsInstructions';
import LinkAddress from '../components/LinkAddress';
import { MarketInfo } from '../utils/types';
import Orderbook from '../components/Orderbook';
import StandaloneBalancesDisplay from '../components/StandaloneBalancesDisplay';
import { TVChartContainer } from '../components/TradingView';
import TradeForm from '../components/TradeForm';
import TradesTable from '../components/TradesTable';
import UserInfoTable from '../components/UserInfoTable';
import { notify } from '../utils/notifications';
import styled from 'styled-components';
import { nanoid } from 'nanoid';
import WhiteBox from '../components/layout/WhiteBox';

const { Option, OptGroup } = Select;

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  .borderNone .ant-select-selector {
    border: none !important;
  }
`;

export default function TradePage() {
  const { marketAddress } = useParams();
  useEffect(() => {
    if (marketAddress) {
      localStorage.setItem('marketAddress', JSON.stringify(marketAddress));
    }
  }, [marketAddress]);
  const history = useHistory();
  function setMarketAddress(address) {
    history.push(getTradePageUrl(address));
  }

  return (
    <MarketProvider
      marketAddress={marketAddress}
      setMarketAddress={setMarketAddress}
    >
      <TradePageInner />
    </MarketProvider>
  );
}

function MarketSelector({
  markets,
  placeholder,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
}) {
  const { market, setMarketAddress } = useMarket();

  const onSetMarketAddress = (marketAddress) => {
    setHandleDeprecated(false);
    setMarketAddress(marketAddress);
  };

  const selectedMarket = getMarketInfos(customMarkets)
    .find(
      (proposedMarket) =>
        market?.address && proposedMarket.address.equals(market.address),
    )
    ?.address?.toBase58();

  const uniqueArray = (arr) => {
    let addList: string[] = [];
    let reList: MarketInfo[] = [];
    for (let index = 0; index < arr.length; index += 1) {
      if (addList.indexOf(arr[index].address.toBase58()) === -1) {
        reList.push(arr[index]);
        addList.push(arr[index].address.toBase58());
      }
    }
    return reList;
  };

  return (
    <Select
      showSearch
      size={'large'}
      // bordered={false}
      style={{
        width: 230,
        fontWeight: 'bold',
        cursor: 'pointer',
        // marginLeft: '10px',
      }}
      placeholder={placeholder || 'Select a market'}
      optionFilterProp="name"
      onSelect={onSetMarketAddress}
      listHeight={400}
      value={selectedMarket}
      filterOption={(input, option) =>
        option?.name?.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    >
      {customMarkets && customMarkets.length > 0 && (
        <OptGroup label="Custom">
          {customMarkets.map(({ address, name }, i) => (
            <Option
              value={address}
              key={nanoid()}
              name={name}
              style={{
                padding: '10px',
                // @ts-ignore
                // backgroundColor: i % 2 === 0 ? '#f1f3f5' : null,
              }}
            >
              <Row>
                <Col flex="auto">{name}</Col>
                {selectedMarket !== address && (
                  <Col>
                    <DeleteOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                        onDeleteCustomMarket && onDeleteCustomMarket(address);
                      }}
                    />
                  </Col>
                )}
              </Row>
            </Option>
          ))}
        </OptGroup>
      )}
      <OptGroup label="Markets">
        {uniqueArray(markets).map(({ address, name, deprecated }, i) => (
          <Option
            value={address.toBase58()}
            key={nanoid()}
            name={name}
            style={{
              padding: '10px',
              // @ts-ignore
              // backgroundColor: i % 2 === 0 ? '#f1f3f5' : null,
            }}
          >
            {name} {deprecated ? ' (Deprecated)' : null}
          </Option>
        ))}
      </OptGroup>
    </Select>
  );
}

const DeprecatedMarketsPage = ({ switchToLiveMarkets }) => {
  return (
    <>
      <Row>
        <Col flex="auto">
          <DeprecatedMarketsInstructions
            switchToLiveMarkets={switchToLiveMarkets}
          />
        </Col>
      </Row>
    </>
  );
};

function TradePageInner() {
  const {
    market,
    marketName,
    customMarkets,
    setCustomMarkets,
    setMarketAddress,
  } = useMarket();
  // const markets = useMarketsList();
  const [handleDeprecated, setHandleDeprecated] = useState(false);
  const [addMarketVisible, setAddMarketVisible] = useState(false);
  const deprecatedMarkets = useUnmigratedDeprecatedMarkets();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    document.title = marketName ? `${marketName} — lunedex` : 'lunedex';
  }, [marketName]);

  const changeOrderRef =
    useRef<({ size, price }: { size?: number; price?: number }) => void>();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const width = dimensions?.width;

  const onAddCustomMarket = (customMarket) => {
    const marketInfo = getMarketInfos(customMarkets).some(
      (m) => m.address.toBase58() === customMarket.address,
    );
    if (marketInfo) {
      notify({
        message: `A market with the given ID already exists`,
        type: 'error',
      });
      return;
    }
    const newCustomMarkets = [...customMarkets, customMarket];
    setCustomMarkets(newCustomMarkets);
    setMarketAddress(customMarket.address);
  };

  const onDeleteCustomMarket = (address) => {
    const newCustomMarkets = customMarkets.filter((m) => m.address !== address);
    setCustomMarkets(newCustomMarkets);
  };
  // const [newMarKets] = useState(markets);

  const rightProps = {
    onChangeOrderRef: (ref) => (changeOrderRef.current = ref),
    onPrice: useCallback(
      (price) => changeOrderRef.current && changeOrderRef.current({ price }),
      [],
    ),
    onSize: useCallback(
      (size) => changeOrderRef.current && changeOrderRef.current({ size }),
      [],
    ),
  };

  const leftProps = {
    onChangeOrderRef: (ref) => (changeOrderRef.current = ref),
    setHandleDeprecated,
    customMarkets,
    onDeleteCustomMarket,
    market,
    setAddMarketVisible,
    deprecatedMarkets,
    handleDeprecated,
  };

  if (handleDeprecated) {
    return (
      <DeprecatedMarketsPage
        switchToLiveMarkets={() => setHandleDeprecated(false)}
      />
    );
  } else if (width < 1000) {
    return (
      <>
        <CustomMarketDialog
          visible={addMarketVisible}
          onClose={() => setAddMarketVisible(false)}
          onAddCustomMarket={onAddCustomMarket}
        />
        <Wrapper style={{ margin: '0 5px', padding: '5px 0' }}>
          <RenderMobile {...rightProps} {...leftProps} />
        </Wrapper>
      </>
    );
  } else {
    return (
      <>
        <CustomMarketDialog
          visible={addMarketVisible}
          onClose={() => setAddMarketVisible(false)}
          onAddCustomMarket={onAddCustomMarket}
        />
        <Wrapper style={{ margin: '0 85px', padding: '16px 0' }}>
          <Row>
            <Col span={16}>
              <RenderLeftCol {...leftProps} />
            </Col>
            <Col span={8}>
              <RenderRightCol {...rightProps} />
            </Col>
          </Row>
        </Wrapper>
      </>
    );
  }
}

const RenderLeftCol = ({
  onChangeOrderRef,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
  market,
  setAddMarketVisible,
  deprecatedMarkets,
  handleDeprecated,
}) => {
  return (
    <Col>
      <WhiteBox>
        <Row style={{ padding: '16px' }}>
          <Row>
            <Col>
              <MarketSelector
                markets={useMarketsList()}
                setHandleDeprecated={setHandleDeprecated}
                placeholder={'Select market'}
                customMarkets={customMarkets}
                onDeleteCustomMarket={onDeleteCustomMarket}
              />
            </Col>
            {market ? (
              <Col>
                <Popover
                  content={
                    <LinkAddress address={market.publicKey.toBase58()} />
                  }
                  placement="bottomRight"
                  title="Market address"
                  trigger="hover"
                >
                  <InfoCircleOutlined
                    style={{ color: '#26a69a', margin: '10px 0 0 10px' }}
                  />
                </Popover>
              </Col>
            ) : null}
            <Col>
              <PlusCircleOutlined
                style={{ color: '#26a69a', margin: '10px 0 0 10px' }}
                onClick={() => setAddMarketVisible(true)}
              />
            </Col>
            {deprecatedMarkets && deprecatedMarkets.length > 0 && (
              <React.Fragment>
                <Col>
                  <Typography>
                    You have unsettled funds on old markets! Please go through
                    them to claim your funds.
                  </Typography>
                </Col>
                <Col>
                  <Button
                    onClick={() => setHandleDeprecated(!handleDeprecated)}
                  >
                    {handleDeprecated
                      ? 'View new markets'
                      : 'Handle old markets'}
                  </Button>
                </Col>
              </React.Fragment>
            )}
          </Row>
          <Row></Row>
        </Row>
      </WhiteBox>
      <Row>
        <Col flex="100%">
          <WhiteBox>
            <TVChartContainer />
          </WhiteBox>
        </Col>
      </Row>
      <Row>
        <Col flex="40%" style={{ height: '100%', minWidth: '280px' }}>
          <WhiteBox>
            <StandaloneBalancesDisplay />
          </WhiteBox>
        </Col>
        <Col flex="60%" style={{ height: '100%', minWidth: '280px' }}>
          <WhiteBox>
            <UserInfoTable smallScreen={false} />
          </WhiteBox>
        </Col>
      </Row>
    </Col>
  );
};

const RenderRightCol = ({ onPrice, onSize, onChangeOrderRef }) => {
  return (
    <>
      <Row>
        <Col flex="50%" style={{ height: '100%' }}>
          <WhiteBox>
            <Orderbook smallScreen={false} onPrice={onPrice} onSize={onSize} />
          </WhiteBox>
        </Col>
        <Col flex="50%" style={{ height: '100%' }}>
          <WhiteBox>
            <TradesTable smallScreen={false} />
          </WhiteBox>
        </Col>
      </Row>
      <Row>
        <Col flex="100%">
          <WhiteBox>
            <TradeForm
              setChangeOrderRef={onChangeOrderRef}
              smallScreen={false}
            />
          </WhiteBox>
        </Col>
      </Row>
    </>
  );
};

const RenderMobile = ({
  onPrice,
  onSize,
  onChangeOrderRef,
  setHandleDeprecated,
  customMarkets,
  onDeleteCustomMarket,
  market,
  setAddMarketVisible,
  deprecatedMarkets,
  handleDeprecated,
}) => {
  return (
    <>
      <WhiteBox style={{ margin: '5px' }}>
        <Row style={{ padding: '8px' }}>
          <Col span={20}>
            <MarketSelector
              markets={useMarketsList()}
              setHandleDeprecated={setHandleDeprecated}
              placeholder={'Select market'}
              customMarkets={customMarkets}
              onDeleteCustomMarket={onDeleteCustomMarket}
            />
          </Col>
          {market ? (
            <Col>
              <Popover
                content={<LinkAddress address={market.publicKey.toBase58()} />}
                placement="bottomRight"
                title="Market address"
                trigger="click"
              >
                <InfoCircleOutlined
                  style={{ color: '#26a69a', margin: '10px 0 0 10px' }}
                />
              </Popover>
            </Col>
          ) : null}
          <Col>
            <PlusCircleOutlined
              style={{ color: '#26a69a', margin: '10px 0 0 10px' }}
              onClick={() => setAddMarketVisible(true)}
            />
          </Col>
          {deprecatedMarkets && deprecatedMarkets.length > 0 && (
            <React.Fragment>
              <Col>
                <Typography>
                  You have unsettled funds on old markets! Please go through
                  them to claim your funds.
                </Typography>
              </Col>
              <Col>
                <Button onClick={() => setHandleDeprecated(!handleDeprecated)}>
                  {handleDeprecated ? 'View new markets' : 'Handle old markets'}
                </Button>
              </Col>
            </React.Fragment>
          )}
        </Row>
      </WhiteBox>
      <Row>
        <Col flex={'100%'}>
          <WhiteBox style={{ margin: '5px' }}>
            <TVChartContainer smallScreen={true} />
          </WhiteBox>
        </Col>
      </Row>
      <WhiteBox style={{ margin: '5px' }}>
        <Row>
          <Col span={12} style={{ height: '400px' }}>
            <div style={{ display: 'inline' }}>
              <Orderbook smallScreen={true} onPrice={onPrice} onSize={onSize} />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'inline' }}>
              <TradeForm
                setChangeOrderRef={onChangeOrderRef}
                smallScreen={true}
              />
            </div>
          </Col>
        </Row>
      </WhiteBox>
      <Row>
        <Col flex="100%">
          <WhiteBox style={{ margin: '5px' }}>
            <UserInfoTable smallScreen={true} />
          </WhiteBox>
        </Col>
      </Row>
      <Row>
        <Col flex="100%">
          <WhiteBox style={{ margin: '5px' }}>
            <StandaloneBalancesDisplay />
          </WhiteBox>
        </Col>
      </Row>
      <Row>
        <Col flex="100%">
          <WhiteBox style={{ margin: '5px' }}>
            <TradesTable smallScreen={true} />
          </WhiteBox>
        </Col>
      </Row>
    </>
  );
};
