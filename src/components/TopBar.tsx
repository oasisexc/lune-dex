import {
  Col,
  Row,
  Select,
  Popover,
  // Button,
  // Menu
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import textLogo from '../assets/textLogo.svg';
import styled from 'styled-components';
import { ENDPOINTS, useConnectionConfig } from '../utils/connection';
import CustomClusterEndpointDialog from './CustomClusterEndpointDialog';
import { EndpointInfo } from '../utils/types';
import { notify } from '../utils/notifications';
import { Connection } from '@solana/web3.js';
import WalletConnect from './WalletConnect';
import { getTradePageUrl } from '../utils/markets';
import {
  InfoCircleOutlined,
  // PlusCircleOutlined,
  // SettingOutlined,
} from '@ant-design/icons';
// import { useWallet } from '../utils/wallet';
// import Settings from './Settings';

const Wrapper = styled.div`
  // flex-direction: row;
  // justify-content: flex-end;
  // flex-wrap: wrap;
`;
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #2abdd2;
  font-weight: bold;
  cursor: pointer;
  img {
    height: 32px;
    margin-right: 8px;
  }
`;

export default function TopBar() {
  const {
    endpoint,
    endpointInfo,
    setEndpoint,
    availableEndpoints,
    setCustomEndpoints,
  } = useConnectionConfig();
  const [addEndpointVisible, setAddEndpointVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const location = useLocation();
  const history = useHistory();
  // const { connected, wallet } = useWallet();

  const onAddCustomEndpoint = (info: EndpointInfo) => {
    const existingEndpoint = availableEndpoints.some(
      (e) => e.endpoint === info.endpoint,
    );
    if (existingEndpoint) {
      notify({
        message: `An endpoint with the given url already exists`,
        type: 'error',
      });
      return;
    }

    const handleError = (e) => {
      console.log(`Connection to ${info.endpoint} failed: ${e}`);
      notify({
        message: `Failed to connect to ${info.endpoint}`,
        type: 'error',
      });
    };

    try {
      const connection = new Connection(info.endpoint, 'recent');
      connection
        .getEpochInfo()
        .then((result) => {
          setTestingConnection(true);
          console.log(`testing connection to ${info.endpoint}`);
          const newCustomEndpoints = [
            ...availableEndpoints.filter((e) => e.custom),
            info,
          ];
          setEndpoint(info.endpoint);
          setCustomEndpoints(newCustomEndpoints);
        })
        .catch(handleError);
    } catch (e) {
      handleError(e);
    } finally {
      setTestingConnection(false);
    }
  };

  const endpointInfoCustom = endpointInfo && endpointInfo.custom;
  useEffect(() => {
    const handler = () => {
      if (endpointInfoCustom) {
        setEndpoint(ENDPOINTS[0].endpoint);
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [endpointInfoCustom, setEndpoint]);

  const tradePageUrl = location.pathname.startsWith('/market/')
    ? location.pathname
    : getTradePageUrl();

  // const { SubMenu } = Menu;

  // const menuDiv = (
  //   <Menu
  //     mode="horizontal"
  //     defaultSelectedKeys={['Trading']}
  //     style={{
  //       fontSize: '16px',
  //       display: 'flex',
  //       justifyContent: 'center',
  //       background: '#f8f9fa',
  //     }}
  //     selectable={false}
  //   >
  //     {MENU.map((item) => {
  //       if (item.child === undefined) {
  //         return (
  //           <Menu.Item key={item.title}>
  //             <a
  //               href={item.link}
  //               target={item.link.startsWith('/') ? '_self' : '_blank'}
  //               rel="noopener noreferrer"
  //             >
  //               {item.title}
  //             </a>
  //           </Menu.Item>
  //         );
  //       } else {
  //         return (
  //           <SubMenu key={item.title} title={item.title}>
  //             {item.child.map((itemChild) => (
  //               <Menu.Item key={itemChild.title}>
  //                 <a
  //                   href={itemChild.link}
  //                   target={itemChild.link.startsWith('/') ? '_self' : '_blank'}
  //                   rel="noopener noreferrer"
  //                 >
  //                   {itemChild.title}
  //                 </a>
  //               </Menu.Item>
  //             ))}
  //           </SubMenu>
  //         );
  //       }
  //     })}
  //   </Menu>
  // );

  return (
    <>
      <CustomClusterEndpointDialog
        visible={addEndpointVisible}
        testingConnection={testingConnection}
        onAddCustomEndpoint={onAddCustomEndpoint}
        onClose={() => setAddEndpointVisible(false)}
      />
      <Wrapper
        style={{
          background: '#ffffff',
          boxShadow: '0 1px 0 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Row wrap={false} style={{ height: 64 }}>
          <Col flex="none">
            <LogoWrapper
              onClick={() => history.push(tradePageUrl)}
              style={{ paddingLeft: 20, paddingTop: 16 }}
            >
              <img src={textLogo} alt="" style={{ width: 121, height: 32 }} />
            </LogoWrapper>
          </Col>
          <Col flex="auto" style={{ textAlign: 'center' }}>
            {/* {menuDiv} */}
          </Col>
          {/* <Col>
            <Popover
              content={endpoint}
              placement="bottomRight"
              title="URL"
              trigger="hover"
            >
              <InfoCircleOutlined
                style={{ color: '#2abdd2', marginRight: '10px' }}
              />
            </Popover>
          </Col>
          <Col>
            <Select
              onSelect={setEndpoint}
              value={endpoint}
              style={{ marginRight: 8, width: '150px' }}
            >
              {availableEndpoints.map(({ name, endpoint }) => (
                <Select.Option value={endpoint} key={endpoint}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Col> */}

          {/* <Col>
            {connected && (
              <div>
                <Popover
                  content={<Settings autoApprove={wallet?.autoApprove} />}
                  placement="bottomRight"
                  title="Settings"
                  trigger="click"
                >
                  <Button style={{ marginRight: 8 }}>
                    <SettingOutlined />
                    Settings
                  </Button>
                </Popover>
              </div>
            )}
          </Col> */}
          <Col flex="none" style={{ paddingRight: 20 }}>
            <WalletConnect />
          </Col>
        </Row>
      </Wrapper>
    </>
  );
}
