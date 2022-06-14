import React from 'react';
import { TokenAccount } from '../utils/types';
import { useSelectedTokenAccounts } from '../utils/markets';
import { Button, Col, Select, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { abbreviateAddress } from '../utils/utils';
import { notify } from '../utils/notifications';

export default function StandaloneTokenAccountsSelect({
  accounts,
  mint,
  label,
}: {
  accounts: TokenAccount[] | null | undefined;
  mint: string | undefined;
  label?: boolean;
}) {
  const [selectedTokenAccounts, setSelectedTokenAccounts] =
    useSelectedTokenAccounts();

  let selectedValue: string | undefined;
  if (mint && mint in selectedTokenAccounts) {
    selectedValue = selectedTokenAccounts[mint];
  } else if (accounts && accounts?.length > 0) {
    selectedValue = accounts[0].pubkey.toBase58();
  } else {
    selectedValue = undefined;
  }

  const setTokenAccountForCoin = (value) => {
    if (!mint) {
      notify({
        message: 'Error selecting token account',
        description: 'Mint is undefined',
        type: 'error',
      });
      return;
    }
    const newSelectedTokenAccounts = { ...selectedTokenAccounts };
    newSelectedTokenAccounts[mint] = value;
    setSelectedTokenAccounts(newSelectedTokenAccounts);
  };

  return (
    <React.Fragment>
      {label && (
        <Col span={4} style={{ fontSize: 14 }}>
          토큰계좌
        </Col>
      )}
      <Col span={14} offset={1}>
        <Select
          style={{ width: '100%' }}
          value={selectedValue}
          onSelect={setTokenAccountForCoin}
        >
          {accounts?.map((account) => (
            <Select.Option
              key={account.pubkey.toBase58()}
              value={account.pubkey.toBase58()}
            >
              <Typography.Text code>
                {label
                  ? abbreviateAddress(account.pubkey, 8)
                  : account.pubkey.toBase58()}
              </Typography.Text>
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col span={5} style={{ textAlign: 'right' }}>
        <Button
          // shape="round"
          style={{
            width: '65px',
            // padding: '0 15px',
            border: '1px solid rgba(241,241,242,0.5)',
          }}
          icon={<CopyOutlined />}
          size={'small'}
          onClick={() =>
            selectedValue && navigator.clipboard.writeText(selectedValue)
          }
        />
      </Col>
    </React.Fragment>
  );
}
