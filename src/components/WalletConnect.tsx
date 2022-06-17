import React from 'react';
import { Dropdown, Menu } from 'antd';
import { useWallet } from '../utils/wallet';
import LinkAddress from './LinkAddress';

export default function WalletConnect() {
  const { connected, wallet, select, connect, disconnect } = useWallet();
  const publicKey = (connected && wallet?.publicKey?.toBase58()) || '';

  const menu = (
    <Menu>
      {connected && (
        <Menu.Item key="3" onClick={disconnect}>
          연결끊기
        </Menu.Item>
      )}
      <Menu.Item key="3" onClick={select}>
        지갑변경
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown.Button onClick={connect} overlay={menu}>
      {connected ? (
        <div style={{ marginTop: '-4px' }}>
          <LinkAddress shorten={true} address={publicKey} />
        </div>
      ) : (
        '지갑연결'
      )}
    </Dropdown.Button>
  );
}
