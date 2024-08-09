import {
  customElements,
  ControlElement,
  customModule,
  Module,
  Styles,
  GridLayout,
  Label,
  Container,
  Input,
  Control,
  Panel,
  Button,
  HStack,
  IconName
} from '@ijstech/components'
import { BigNumber, nullAddress } from '@ijstech/eth-contract'
import customStyle, { buttonStyle } from './index.css'
import { IType } from './global/index'
import { CUSTOM_TOKEN, formatNumber, getTokenInfo } from './utils/index'
import { ChainNativeTokenByChainId, tokenStore, assets, DefaultERC20Tokens, ITokenObject } from '@scom/scom-token-list'
import { TokenSelect } from './tokenSelect'
import ScomTokenModal from '@scom/scom-token-modal'
import { Wallet } from '@ijstech/eth-wallet'
export { CUSTOM_TOKEN };

const Theme = Styles.Theme.ThemeVars;

interface IModalStyles {
  maxWidth?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  background?: {
    color?: string;
    image?: string;
  };
}
interface IButtonStyles extends ControlElement {
  caption?: string;
  icon?: any;
  rightIcon?: any;
}
const defaultTokenProps = {
  id: 'btnToken',
  height: '100%',
  caption: 'Select Token',
  rightIcon: {width: 14, height: 14, name: 'angle-down' as IconName},
  border: {radius: 0},
  background: {color: 'transparent'},
  font: {color: Theme.input.fontColor},
  padding: {
    top: '0.25rem',
    bottom: '0.25rem',
    left: '0.5rem',
    right: '0.5rem',
  },
  class: buttonStyle
}

interface ScomTokenInputElement extends ControlElement {
  type?: IType;
  title?: string;
  token?: ITokenObject;
  tokenDataListProp?: ITokenObject[];
  readOnly?: boolean;
  tokenReadOnly?: boolean;
  inputReadOnly?: boolean;
  withoutConnected?: boolean;
  importable?: boolean;
  isSortBalanceShown?: boolean;
  isBtnMaxShown?: boolean;
  isCommonShown?: boolean;
  isInputShown?: boolean;
  isBalanceShown?: boolean;
  value?: any;
  placeholder?: string;
  address?: string;
  chainId?: number;
  modalStyles?: IModalStyles;
  tokenButtonStyles?: IButtonStyles;
  supportValidAddress?: boolean;
  isCustomTokenShown?: boolean;
  onInputAmountChanged?: (target: Control, event: Event) => void;
  onSelectToken?: (token: ITokenObject | undefined) => void;
  onSetMaxBalance?: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-token-input']: ScomTokenInputElement
    }
  }
}

@customModule
@customElements('i-scom-token-input')
export default class ScomTokenInput extends Module {
  private gridTokenInput: GridLayout
  private inputAmount: Input
  private lbBalance: Label
  private pnlTitle: HStack
  private pnlBalance: Panel
  private mdToken: ScomTokenModal
  private cbToken: TokenSelect
  private btnMax: Button
  private btnToken: Button;
  private pnlTopSection: HStack;
  private pnlTokenBtn: HStack;

  private _type: IType
  private _token: ITokenObject;
  private _address: string;
  private _title: string | Control
  private _isCommonShown: boolean = false
  private _isSortBalanceShown: boolean = true
  private _isBtnMaxShown: boolean = true
  private _readOnly: boolean = false
  private _tokenReadOnly: boolean = false
  private _inputReadOnly: boolean = false
  private _importable: boolean = false
  private _isInputShown: boolean = true
  private _isBalanceShown: boolean = true
  private _tokenDataListProp: ITokenObject[] = []
  private _withoutConnected: boolean = false;
  private _chainId: number;
  private _modalStyles: IModalStyles;
  private _tokenButtonStyles: IButtonStyles;
  private tokenBalancesMap: any;
  private _supportValidAddress: boolean = false;
  private _isCustomTokenShown: boolean = false;
  private _onSelectToken: (token: ITokenObject | undefined) => void;
  public onChanged: (token?: ITokenObject) => void;
  public onInputAmountChanged: (target: Control, event: Event) => void
  public onSetMaxBalance: () => void

  constructor(parent?: Container, options?: ScomTokenInputElement) {
    super(parent, options);
    this.onButtonClicked = this.onButtonClicked.bind(this);
  }

  static async create(options?: ScomTokenInputElement, parent?: Container) {
    let self = new this(parent, options);
    await self.ready();
    return self;
  }

  // private async onRefresh() {
  //   if (isWalletConnected()) {
  //     this.tokenBalancesMap = tokenStore.getTokenBalancesByChainId(this._chainId) || {};
  //     if (this.token) {
  //       const token = this.tokenDataList.find(
  //         (t) =>
  //           (t.address && t.address == this.token?.address) ||
  //           t.symbol == this.token?.symbol
  //       )
  //       if (!token) this.token = undefined
  //       else this.token = token;
  //     }
  //   }
  //   this.updateTokenUI();
  //   this.renderTokenList();
  //   this.updateStatusButton();
  //   this.pnlTopSection.visible = this.isBalanceShown && !!this.title;
  // }

  get tokenDataListProp(): Array<ITokenObject> {
    return this._tokenDataListProp ?? [];
  }

  set tokenDataListProp(value: Array<ITokenObject>) {
    this._tokenDataListProp = value ?? [];
    if (this.type === 'button') {
      if (this.mdToken) this.mdToken.tokenDataListProp = this.tokenDataListProp;
    }
  }

  private get tokenListByChainId() {
    let list: ITokenObject[] = [];
    const propList = this.tokenDataListProp.filter(f => !f.chainId || f.chainId === this.chainId);
    const nativeToken = ChainNativeTokenByChainId[this.chainId];
    const tokens = DefaultERC20Tokens[this.chainId];
    for (const token of propList) {
      const tokenAddress = token.address?.toLowerCase();
      if (!tokenAddress || tokenAddress === nativeToken?.symbol?.toLowerCase()) {
        if (nativeToken) list.push({ ...nativeToken, chainId: this.chainId });
      } else {
        const tokenObj = tokens.find(v => v.address?.toLowerCase() === tokenAddress);
        if (tokenObj) list.push({ ...token, chainId: this.chainId });
      }
    }
    return list;
  }

  private get tokenDataList(): ITokenObject[] {
    let tokenList: ITokenObject[] = this.tokenListByChainId?.length ? this.tokenListByChainId : tokenStore.getTokenList(this.chainId);
    if (this.tokenDataListProp && this.tokenDataListProp.length) {
      tokenList = this.tokenDataListProp;
    }
    if (!this.tokenBalancesMap || !Object.keys(this.tokenBalancesMap).length) {
      this.tokenBalancesMap = tokenStore.getTokenBalancesByChainId(this._chainId) || {};
    }
    return tokenList.map((token: ITokenObject) => {
      const tokenObject = { ...token };
      const nativeToken = ChainNativeTokenByChainId[this.chainId];
      if (nativeToken?.symbol && token.symbol === nativeToken.symbol) {
        Object.assign(tokenObject, { isNative: true })
      }
      if (!Wallet.getClientInstance().isConnected){
        Object.assign(tokenObject, {
          balance: 0,
        })
      }
      else if (this.tokenBalancesMap) {
        Object.assign(tokenObject, {
          balance: this.tokenBalancesMap[token.address?.toLowerCase() || token.symbol] || 0,
        })
      }
      return tokenObject;
    }).sort(this.sortToken);
  }

  private sortToken = (a: any, b: any, asc?: boolean) => {
    if (a.symbol.toLowerCase() < b.symbol.toLowerCase()) {
      return -1
    }
    if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) {
      return 1
    }
    return 0
  }

  get onSelectToken(): any {
    return this._onSelectToken;
  }

  set onSelectToken(callback: any) {
    this._onSelectToken = callback;
  }

  get type(): IType {
    return this._type ?? 'button'
  }
  set type(value: IType) {
    if (value === this._type) return
    this._type = value
    if (this.btnToken)
      this.btnToken.width = value === 'button' ? "auto" : '100%'
    // this.onRefresh()
  }

  get title(): any {
    return this._title ?? ''
  }
  set title(value: string | Control) {
    this._title = value
    let labelEl: Control
    if (typeof value === 'string') {
      labelEl = new Label(undefined, {
        caption: value,
        font: { color: Theme.colors.primary.main, size: '1rem', bold: true },
      })
    } else {
      labelEl = value
    }
    if (!this.pnlTitle) this.pnlTitle = new HStack()
    this.pnlTitle.clearInnerHTML()
    this.pnlTitle.appendChild(labelEl)
  }

  get token() {
    return this._token;
  }
  set token(value: ITokenObject | undefined) {
    this._token = value;
    // this.onSelectFn(value)
    if (this.cbToken)
      this.cbToken.token = value
    if (this.mdToken)
      this.mdToken.token = value
    this.updateTokenUI();
  }

  get address() {
    return this._address;
  }

  set address(value: string) {
    this._address = value;
    if (!value) {
      this.token = null;
      return;
    }
    const tokenAddress = value.toLowerCase();
    let tokenObj = null;
    if (tokenAddress === CUSTOM_TOKEN.address.toLowerCase()) {
      tokenObj = CUSTOM_TOKEN;
    } else if (tokenAddress.startsWith('0x') && tokenAddress !== nullAddress) {
      tokenObj = DefaultERC20Tokens[this.chainId]?.find(v => v.address?.toLowerCase() === tokenAddress);
    } else {
      const nativeToken = ChainNativeTokenByChainId[this.chainId];
      tokenObj = (tokenAddress === nullAddress || nativeToken?.symbol?.toLowerCase() === tokenAddress) ? nativeToken : null;
    }
    this.token = tokenObj;
    if (!tokenObj) this.updateCustomToken();
  }

  get chainId() {
    return this._chainId;
  }

  set chainId(value: number | undefined) {
    this._chainId = value;
  }

  get isCommonShown(): boolean {
    return this._isCommonShown;
  }
  set isCommonShown(value: boolean) {
    this._isCommonShown = value;
    if (this.mdToken)
      this.mdToken.isCommonShown = value;
  }

  get isSortBalanceShown(): boolean {
    return this._isSortBalanceShown;
  }
  set isSortBalanceShown(value: boolean) {
    this._isSortBalanceShown = value;
    if (this.mdToken)
      this.mdToken.isSortBalanceShown = value;
  }

  get isBtnMaxShown(): boolean {
    return this._isBtnMaxShown;
  }
  set isBtnMaxShown(value: boolean) {
    this._isBtnMaxShown = value;
    if (this.btnMax) this.btnMax.visible = value
  }

  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(value: boolean) {
    this._readOnly = value;
    if (this.btnToken) {
      this.btnToken.enabled = !value
      this.btnToken.rightIcon.visible = !value
    }
    if (this.btnMax)
      this.btnMax.enabled = !value
    if (this.inputAmount)
      this.inputAmount.readOnly = value;
  }

  get tokenReadOnly(): boolean {
    return this._tokenReadOnly;
  }
  set tokenReadOnly(value: boolean) {
    this._tokenReadOnly = value;
    if (this.btnToken) {
      this.btnToken.enabled = !this._readOnly && !value;
      this.btnToken.rightIcon.visible = !this._readOnly && !value
    }
  }

  get inputReadOnly(): boolean {
    return this._inputReadOnly;
  }
  set inputReadOnly(value: boolean) {
    this._inputReadOnly = value;
    if (this.inputAmount) {
      this.inputAmount.readOnly = value;
    }
  }

  get importable(): boolean {
    return this._importable;
  }
  set importable(value: boolean) {
    this._importable = value;
    if (this.mdToken)
      this.mdToken.importable = value;
  }

  get isInputShown(): boolean {
    return this._isInputShown;
  }
  set isInputShown(value: boolean) {
    this._isInputShown = value;
    if (this.inputAmount)
      this.inputAmount.visible = value;
    if (this.gridTokenInput)
      this.gridTokenInput.templateColumns = value ? ['50%', 'auto'] : ['auto'];
    if (this.pnlTokenBtn)
      this.pnlTokenBtn.horizontalAlignment = value ? 'end' : 'start';
  }

  get isBalanceShown(): boolean {
    return this._isBalanceShown;
  }
  set isBalanceShown(value: boolean) {
    this._isBalanceShown = value;
    if (this.pnlBalance) this.pnlBalance.visible = value;
  }

  get supportValidAddress(): boolean {
    return this._supportValidAddress;
  }
  set supportValidAddress(value: boolean) {
    this._supportValidAddress = value;
    if (this.cbToken) this.cbToken.supportValidAddress = value;
  }

  get isCustomTokenShown() {
    return this._isCustomTokenShown;
  }
  set isCustomTokenShown(value: boolean) {
    this._isCustomTokenShown = value;
    if (this.cbToken) this.cbToken.isCustomTokenShown = value;
  }

  get amount(): string {
    return this.inputAmount.value
  }

  get placeholder() {
    return this.inputAmount?.placeholder ?? 'Enter an amount'
  }
  set placeholder(value: string) {
    this.inputAmount.placeholder = value ?? 'Enter an amount'
  }

  get value() {
    return this.inputAmount.value
  }
  set value(value: any) {
    if (this.inputAmount)
      this.inputAmount.value = value
  }

  get modalStyles() {
    return this._modalStyles;
  }
  set modalStyles(value: IModalStyles) {
    this._modalStyles = value;
    if (value.maxWidth !== undefined) {
      if (this.cbToken) this.cbToken.maxWidth = value.maxWidth;
      if (this.mdToken) this.mdToken.maxWidth = value.maxWidth;
    }
    if (value.minWidth !== undefined) {
      if (this.cbToken) this.cbToken.minWidth = value.minWidth;
      if (this.mdToken) this.mdToken.minWidth = value.minWidth;
    }
    if (value.maxHeight !== undefined) {
      if (this.cbToken) this.cbToken.maxHeight = value.maxHeight;
      if (this.mdToken) this.mdToken.maxHeight = value.maxHeight;
    }
    if (value.background) {
      if (this.cbToken) this.cbToken.background = value.background;
      if (this.mdToken) this.mdToken.background = value.background;
    }
  }

  get tokenButtonStyles() {
    return this._tokenButtonStyles;
  }
  set tokenButtonStyles(value: IButtonStyles) {
    this._tokenButtonStyles = value;
    if (!this.btnToken) return;
    let tokenBtnProps = value ? {...defaultTokenProps, ...value} : {...defaultTokenProps};
    this.btnToken = new Button(this.pnlTokenBtn, tokenBtnProps);
    this.btnToken.onClick = this.onButtonClicked;
  }

  private getBalance(token?: ITokenObject) {
    let tokenBalances = tokenStore?.getTokenBalancesByChainId(this._chainId)
    if (token && tokenBalances && Object.keys(tokenBalances).length) {
      const address = (token.address || '').toLowerCase();
      let balance = address ? (tokenBalances[address] ?? (token.balance || 0)) : (tokenBalances[token.symbol] || 0);
      return balance;
    }
    return 0;
  }

  private async onSetMax() {
    const balance = this.getBalance(this.token);
    this.inputAmount.value = new BigNumber(balance).dp(4, BigNumber.ROUND_DOWN).toString();
    if (this.onSetMaxBalance) this.onSetMaxBalance();
  }

  private async onAmountChanged(target: Input, event: Event) {
    if (this.onInputAmountChanged) this.onInputAmountChanged(target, event)
  }

  private onToggleFocus(value: boolean) {
    value ?
      this.gridTokenInput.classList.add('focus-style') :
      this.gridTokenInput.classList.remove('focus-style')
  }

  _handleFocus(event: Event) {
    this.onToggleFocus(true)
    return super._handleFocus(event)
  }

  private async updateCustomToken() {
    if (this.token || !this._address || !this.supportValidAddress || !this.chainId) return;
    const token = await getTokenInfo(this._address, this.chainId);
    if (token) {
      if (this.type === 'combobox' && this.cbToken && !this.cbToken.chainId) {
        this.cbToken.chainId = this.chainId;
      }
      this.token = token;
    }
  }

  private async renderTokenList(init?: boolean) {
    if (this.type === 'combobox') {
      if (!this.cbToken) return;
      if (!this.cbToken.isConnected)
        await this.cbToken.ready();
      if (this.cbToken.chainId !== this.chainId) {
        this.cbToken.chainId = this.chainId;
        this.token = null;
      }
      this.cbToken.visible = true;
      if (init && this.cbToken.tokenList?.length && this.tokenDataList.length) {
        const token = this.cbToken.tokenList[0];
        const tokenData = this.tokenDataList[0];
        if (JSON.stringify(token) !== JSON.stringify(tokenData) || this.cbToken.tokenList.length !== this.tokenDataList.length) {
          this.cbToken.tokenList = [...this.tokenDataList];
        }
      } else {
        this.cbToken.tokenList = [...this.tokenDataList]
      }
    } else {
      if (!this.mdToken) return;
      if (!this.mdToken.isConnected)
        await this.mdToken.ready()
      if (this.cbToken) this.cbToken.visible = false
      this.mdToken.tokenDataListProp = this.tokenDataListProp
      if (this.mdToken.onRefresh) this.mdToken.onRefresh()
    }
  }

  private async updateTokenUI() {
    this.value = ''
    this.updateBalance()
    this.updateTokenButton()
  }

  private async updateBalance() {
    if (!this.lbBalance) return;
    if (!this.lbBalance.isConnected) await this.lbBalance.ready();
    if (this.token) {
      const symbol = this.token?.symbol || ''
      const balance = this.getBalance(this.token);
      this.lbBalance.caption = `${formatNumber(balance, 6)} ${symbol}`;
    } else {
      this.lbBalance.caption = '0.00';
    }
  }

  // private updateStatusButton() {
  //   const status = isWalletConnected()
  //   const value = !this.readOnly && (status || this._withoutConnected)
  //   if (this.btnToken) {
  //     this.btnToken.enabled = value && !this.tokenReadOnly
  //   }
  //   if (this.btnMax) {
  //     this.btnMax.enabled = value
  //   }
  // }

  private updateTokenButton() {
    if (!this.btnToken) return
    let token = this.token ? {...this.token} : undefined
    if (!token)
      token = (this.tokenDataList || []).find(
        (v: ITokenObject) =>
          (v.address && v.address == this.token?.address) ||
          v.symbol == this.token?.symbol
      )
    if (token) {
      const tokenIconPath = token.logoURI ||assets.tokenPath(token, this.chainId)
      this.btnToken.caption = `<i-hstack verticalAlignment="center" gap="0.5rem">
          <i-panel>
            <i-image width=${24} height=${24} url="${tokenIconPath}" fallbackUrl="${assets.fallbackUrl}"></i-image>
          </i-panel>
          <i-label caption="${token?.symbol || ''}"></i-label>
        </i-hstack>`
      this.btnMax.visible = this.isBtnMaxShown
    } else {
      this.btnToken.caption = 'Select Token'
      this.btnMax.visible = false
    }
  }

  private async onButtonClicked() {
    // this.onRefresh();
    if (this.type === 'combobox') {
      await this.renderTokenList(true);
      this.cbToken.showModal();
    } else {
      if (this.mdToken.chainId !== this.chainId) {
        this.mdToken.chainId = this.chainId;
      }
      this.mdToken.tokenDataListProp = this.tokenDataListProp;
      this.mdToken.showModal();
    }
  }

  private async onSelectFn(token: ITokenObject | undefined) {
    if (JSON.stringify(this._token) === JSON.stringify(token)) return;
    if (this.onChanged) {
      this.onChanged(token)
    }
    this._token = token
    this.updateTokenUI()
    this.onSelectToken && this.onSelectToken(token)
  }

  init() {
    this.classList.add(customStyle)
    super.init()
    const tokenButtonStyles = this.getAttribute('tokenButtonStyles', true);
    if (tokenButtonStyles) this._tokenButtonStyles = tokenButtonStyles;
    let tokenBtnProps = tokenButtonStyles ? {...defaultTokenProps, ...tokenButtonStyles} : {...defaultTokenProps};
    this.btnToken = new Button(this.pnlTokenBtn, tokenBtnProps);
    this.btnToken.onClick = this.onButtonClicked;
    this.onInputAmountChanged = this.getAttribute('onInputAmountChanged', true) || this.onInputAmountChanged
    this.onSetMaxBalance = this.getAttribute('onSetMaxBalance', true) || this.onSetMaxBalance
    this.onSelectToken = this.getAttribute('onSelectToken', true) || this.onSelectToken
    this.title = this.getAttribute('title', true, '')
    this._withoutConnected = this.getAttribute('withoutConnected', true, false)
    this.chainId = this.getAttribute('chainId', true)
    const address = this.getAttribute('address', true)
    if (address) this.address = address
    const tokenDataListProp = this.getAttribute('tokenDataListProp', true)
    if (tokenDataListProp) this.tokenDataListProp = tokenDataListProp;
    const token = this.getAttribute('token', true)
    if (token) this.token = token
    this.readOnly = this.getAttribute('readOnly', true, false)
    this.tokenReadOnly = this.getAttribute('tokenReadOnly', true, false)
    this.inputReadOnly = this.getAttribute('inputReadOnly', true, false)
    this.isBtnMaxShown = this.getAttribute('isBtnMaxShown', true, true)
    this.type = this.getAttribute('type', true, 'button')
    if (this.type === 'button') {
      this.isCommonShown = this.getAttribute('isCommonShown', true, false)
      this.isSortBalanceShown = this.getAttribute('isSortBalanceShown', true, true)
      this.importable = this.getAttribute('importable', true, false)
    }
    this.isInputShown = this.getAttribute('isInputShown', true, true)
    this.isBalanceShown = this.getAttribute('isBalanceShown', true, true)
    this.placeholder = this.getAttribute('placeholder', true);
    const supportValidAddress = this.getAttribute('supportValidAddress', true);
    if (supportValidAddress != null) this.supportValidAddress = supportValidAddress;
    const isCustomTokenShown = this.getAttribute('isCustomTokenShown', true);
    if (isCustomTokenShown != null) this.isCustomTokenShown = isCustomTokenShown;
    const value = this.getAttribute('value', true);
    if (value !== undefined) this.value = value;
    this.pnlTopSection.visible = this.isBalanceShown;
    this.pnlTopSection.margin = {bottom: this.pnlTopSection.visible ? '0.5rem' : 0};
    const modalStyles = this.getAttribute('modalStyles', true);
    if (modalStyles) this.modalStyles = modalStyles;
    document.addEventListener('click', (event) => {
      const target = event.target as Control
      const tokenInput = target.closest('#gridTokenInput')
      if (!tokenInput || !tokenInput.isSameNode(this.gridTokenInput))
        this.onToggleFocus(false)
      else
        this.onToggleFocus(true)
    })
  }

  render() {
    return (
      <i-hstack
        width='100%' height="100%"
        border={{radius: 'inherit', style: 'none'}}
        verticalAlignment="center"
      >
        <i-vstack
          width='100%' height="100%"
          margin={{top: '0.5rem', bottom: '0.5rem'}}
          border={{radius: 'inherit', style: 'none'}}
          justifyContent="center"
        >
          <i-hstack
            id="pnlTopSection"
            horizontalAlignment='space-between'
            verticalAlignment='center'
            width={'100%'}
          >
            <i-hstack id="pnlTitle" gap="4px"></i-hstack>
            <i-hstack
              id="pnlBalance"
              horizontalAlignment='end'
              verticalAlignment='center'
              gap='0.5rem'
              margin={{bottom: '0.5rem'}}
              opacity={0.6}
            >
              <i-label caption='Balance:' font={{ size: '0.875rem' }}></i-label>
              <i-label id='lbBalance' font={{ size: '0.875rem' }} caption="0"></i-label>
            </i-hstack>
          </i-hstack>
          <i-grid-layout
            id='gridTokenInput'
            templateColumns={['50%', 'auto']}
            background={{ color: Theme.input.background }}
            font={{ color: Theme.input.fontColor }}
            border={{radius: 'inherit', style: 'none'}}
            verticalAlignment='center'
            lineHeight={1.5715}
            width={'100%'}
            gap={{ column: '0.5rem' }}
          >
            <i-input
              id='inputAmount'
              width='100%'
              height='100%'
              font={{size: 'inherit'}}
              inputType='number'
              padding={{left: 0, right: 0, top: 0, bottom: 0}}
              border={{style: 'none'}}
              placeholder='Enter an amount'
              onChanged={this.onAmountChanged}
            ></i-input>
            <i-panel id="pnlSelection" width='100%'>
              <i-hstack id="pnlTokenBtn" verticalAlignment="center" gap="0.25rem">
                <i-button
                  id='btnMax'
                  visible={false}
                  caption='Max'
                  height='100%'
                  background={{ color: Theme.colors.success.main }}
                  font={{ color: Theme.colors.success.contrastText }}
                  padding={{
                    top: '0.25rem',
                    bottom: '0.25rem',
                    left: '0.5rem',
                    right: '0.5rem',
                  }}
                  onClick={() => this.onSetMax()}
                />
                {/* <i-button
                  id='btnToken'
                  class={`${buttonStyle}`}
                  height='100%'
                  caption='Select Token'
                  rightIcon={{ width: 14, height: 14, name: 'angle-down' }}
                  border={{ radius: 0 }}
                  background={{ color: 'transparent' }}
                  font={{ color: Theme.input.fontColor }}
                  padding={{
                    top: '0.25rem',
                    bottom: '0.25rem',
                    left: '0.5rem',
                    right: '0.5rem',
                  }}
                  onClick={this.onButtonClicked}
                ></i-button> */}
              </i-hstack>
              <token-select
                id="cbToken"
                width="100%"
                onSelectToken={this.onSelectFn}
              ></token-select>
              <i-scom-token-modal
                id="mdToken"
                width="100%"
                onSelectToken={this.onSelectFn}
              ></i-scom-token-modal>
            </i-panel>
          </i-grid-layout>
        </i-vstack>
      </i-hstack>
    )
  }
}