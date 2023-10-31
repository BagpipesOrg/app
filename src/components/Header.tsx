// Copyright 2019-2022 @bagpipes/xcm-send authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from 'antd';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OpenSelectWallet, WalletContext } from './Wallet/contexts';
import ThemeContext from '../contexts/ThemeContext';
import'./styles/Header.scss';

interface Props {
  open?: boolean;
  theme: string;

}



function Header ({ open, theme }: Props): React.ReactElement<Props> {
  const navigate = useNavigate();  // Add this line to get the navigate function
  const walletContext = useContext(WalletContext);
  const selectWallet = useContext(OpenSelectWallet);
  const wallet = walletContext.wallet || walletContext.evmWallet;
  const logoSrc = theme === 'dark' ? '/logo-white.svg' : '/logo.svg';

  if (!open) {
    return (<></>);
  }

    // Function to navigate to /builder
    const goToBuilder = () => {
      navigate('/builder');
    };
       // Function to navigate to /builder
       const goToBagpipes = () => {
        navigate('/builder') ;
      };
  
          // Function to navigate to /builder
    const goToLab = () => {
      navigate('/lab');
    };

      return (
        <header className={`wallet-header-wrapper ${theme}`}>
          <div className={'boxed-container'}>
            <div className={'wallet-header-content flex justify-left'}>
              <img src={logoSrc} className='bagpipe-logo' alt="Bagpipe Logo" />
  
              <Button
                className='xcm-send-btn  button-header'
                onClick={goToBagpipes}
                type={'primary'}
              >
                <span className='button-header-text'>Builder</span>
              </Button>
              {/* <Button
                className='xcm-send-btn xcm-send-btn-small-size button-header'
                onClick={goToLab}
                type={'primary'}
                >
                <span className='button-header-text'>Lab</span>
              </Button> */}
                {/* 
              <Button
                className='xcm-send-btn-wallet xcm-send-btn-small-size'
                onClick={selectWallet.open}
                type={'primary'}
              >Select Wallet</Button> */}
            </div>
          </div>
        </header>
      );
      
}

export default Header;
