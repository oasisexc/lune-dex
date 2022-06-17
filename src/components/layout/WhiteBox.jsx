import React from 'react';
import styled from 'styled-components';

export default function WhiteBox(props) {
  return <Container style={{ ...props.style }}>{props.children}</Container>;
}

const Container = styled.div`
  border-radius: 8px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.06);
  background-color: #fff;
  margin: 10px;
`;
