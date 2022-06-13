import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
html,body{
  background: #f8f9fa;
}
input[type=number]::-webkit-inner-spin-button {
  opacity: 0;
}
input[type=number]:hover::-webkit-inner-spin-button,
input[type=number]:focus::-webkit-inner-spin-button {
  opacity: 0.25;
}
/* width */
::-webkit-scrollbar {
  width: 4px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #ffffff;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #b1bac3;
  border-radius: 10px;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #b1bac3;
  border-radius: 10px;
}
.ant-slider-track, .ant-slider:hover .ant-slider-track {
  background-color: #2abdd2;
  opacity: 0.75;
}
.ant-slider-track,
.ant-slider ant-slider-track:hover {
  background-color: #2abdd2;
  opacity: 0.75;
}
.ant-slider-dot-active,
.ant-slider-handle,
.ant-slider-handle-click-focused,
.ant-slider:hover .ant-slider-handle:not(.ant-tooltip-open)  {
  border: 2px solid #2abdd2; 
}
.ant-table-tbody > tr.ant-table-row:hover > td {
  background: #f8f9fa;
}
.ant-table-tbody > tr > td {
  border-bottom: 8px solid #1A2029;
}
.ant-table-container table > thead > tr:first-child th {
  border-bottom: none;
}
.ant-divider-horizontal.ant-divider-with-text::before, .ant-divider-horizontal.ant-divider-with-text::after {
  border-top: 1px solid #434a59 !important;
}
.ant-layout {
    background: #f8f9fa
  }
  .ant-table {
    background: #ffffff;
  }
  .ant-table-thead > tr > th {
    background: #1A2029;
  }
.ant-select-item-option-content {
  img {
    margin-right: 4px;
  }
}
.ant-modal-content {
  background-color: #ffffff;
}

@-webkit-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
@-moz-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
@-keyframes highlight {
  from { background-color: #2abdd2;}
  to {background-color: #1A2029;}
}
.flash {
  -moz-animation: highlight 0.5s ease 0s 1 alternate ;
  -webkit-animation: highlight 0.5s ease 0s 1 alternate;
  animation: highlight 0.5s ease 0s 1 alternate;
}`;
