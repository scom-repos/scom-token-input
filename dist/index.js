var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-token-input/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buttonStyle = void 0;
    exports.buttonStyle = components_1.Styles.style({
        boxShadow: 'none',
        whiteSpace: 'nowrap',
        gap: '0.5rem'
    });
    exports.default = components_1.Styles.style({
        $nest: {
            '#gridTokenInput': {
                boxShadow: 'none',
                outline: 'none',
                transition: 'all .5s ease-in'
            },
            '#gridTokenInput.focus-style': {
            // border: `1px solid ${Theme.colors.primary.main}`,
            // boxShadow: '0 0 0 2px rgba(87, 75, 144, .2)'
            }
        }
    });
});
define("@scom/scom-token-input/global/index.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("@scom/scom-token-input/utils/index.ts", ["require", "exports", "@ijstech/components", "@ijstech/eth-wallet", "@scom/scom-token-list"], function (require, exports, components_2, eth_wallet_1, scom_token_list_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTokenInfo = exports.formatNumber = exports.CUSTOM_TOKEN = void 0;
    const CUSTOM_TOKEN_VALUE = 'Other Token';
    exports.CUSTOM_TOKEN = {
        address: CUSTOM_TOKEN_VALUE,
        name: CUSTOM_TOKEN_VALUE,
        symbol: CUSTOM_TOKEN_VALUE,
        decimals: 0,
        logoURI: scom_token_list_1.assets.fallbackUrl
    };
    const formatNumber = (value, decimals) => {
        const minValue = '0.0000001';
        const newValue = typeof value === 'object' ? value.toString() : value;
        return components_2.FormatUtils.formatNumber(newValue, { decimalFigures: decimals || 4, minValue });
    };
    exports.formatNumber = formatNumber;
    const getTokenInfo = async (address, chainId) => {
        let token;
        const wallet = eth_wallet_1.Wallet.getClientInstance();
        await wallet.init();
        wallet.chainId = chainId;
        const isValidAddress = wallet.isAddress(address);
        if (isValidAddress) {
            const tokenAddress = wallet.toChecksumAddress(address);
            const tokenInfo = await wallet.tokenInfo(tokenAddress);
            if (tokenInfo?.symbol) {
                token = {
                    chainId,
                    address: tokenAddress,
                    name: tokenInfo.name,
                    decimals: tokenInfo.decimals,
                    symbol: tokenInfo.symbol
                };
            }
        }
        return token;
    };
    exports.getTokenInfo = getTokenInfo;
});
define("@scom/scom-token-input/tokenSelect.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tokenStyle = exports.scrollbarStyle = void 0;
    const Theme = components_3.Styles.Theme.ThemeVars;
    exports.scrollbarStyle = components_3.Styles.style({
        $nest: {
            '&::-webkit-scrollbar-track': {
                borderRadius: '12px',
                border: '1px solid transparent',
                backgroundColor: 'unset'
            },
            '&::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: 'unset'
            },
            '&::-webkit-scrollbar-thumb': {
                borderRadius: '12px',
                background: '#d3d3d3 0% 0% no-repeat padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: '#bababa 0% 0% no-repeat padding-box'
            }
        }
    });
    exports.tokenStyle = components_3.Styles.style({
        $nest: {
            '&:hover': {
                background: Theme.action.hoverBackground
            },
            '&.is-selected': {
                background: Theme.action.active,
                $nest: {
                    '.token-symbol': {
                        fontWeight: 600
                    }
                }
            }
        }
    });
    exports.default = components_3.Styles.style({
        $nest: {
            '.box-shadow > div': {
                boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08), 0 9px 28px 8px rgba(0,0,0,.05)'
            },
            '.pointer': {
                cursor: 'pointer'
            },
            'i-input > input': {
                background: 'transparent'
            }
        }
    });
});
define("@scom/scom-token-input/tokenSelect.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-token-list", "@scom/scom-token-input/tokenSelect.css.ts", "@scom/scom-token-input/utils/index.ts"], function (require, exports, components_4, scom_token_list_2, tokenSelect_css_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenSelect = void 0;
    const Theme = components_4.Styles.Theme.ThemeVars;
    let TokenSelect = class TokenSelect extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tokenMap = new Map();
            this.currentToken = '';
            this.filterValue = '';
            this._supportValidAddress = false;
            this._isCustomTokenShown = false;
        }
        get token() {
            return this._token;
        }
        set token(value) {
            this._token = value;
            if (value)
                this.setActive(value);
        }
        get tokenList() {
            return this._tokenList;
        }
        set tokenList(value) {
            this._tokenList = value;
            this.renderTokenList();
        }
        get chainId() {
            return this._chainId;
        }
        set chainId(value) {
            this._chainId = value;
        }
        get supportValidAddress() {
            return this._supportValidAddress;
        }
        set supportValidAddress(value) {
            this._supportValidAddress = value;
        }
        get isCustomTokenShown() {
            return this._isCustomTokenShown;
        }
        set isCustomTokenShown(value) {
            this._isCustomTokenShown = value;
        }
        get tokenDataListFiltered() {
            let tokenList = this.tokenList || [];
            if (tokenList.length && this.filterValue) {
                tokenList = tokenList.filter((token) => {
                    return token.symbol.toLowerCase().includes(this.filterValue) ||
                        token.name.toLowerCase().includes(this.filterValue) ||
                        token.address?.toLowerCase() === this.filterValue;
                });
            }
            return tokenList;
        }
        renderToken(token) {
            const tokenIconPath = token.logoURI || scom_token_list_2.assets.tokenPath(token, this.chainId);
            const isActive = this.token && (token.address === this.token.address || token.symbol === this.token.symbol);
            if (isActive)
                this.currentToken = token.address || token.symbol;
            const tokenElm = (this.$render("i-hstack", { width: '100%', class: `pointer token-item ${tokenSelect_css_1.tokenStyle} ${isActive ? ' is-selected' : ''}`, verticalAlignment: 'center', padding: { top: 5, bottom: 5, left: '0.75rem', right: '0.75rem' }, gap: '0.5rem', onClick: () => this.onSelect(token) },
                this.$render("i-vstack", { width: '100%' },
                    this.$render("i-hstack", { gap: '0.5rem', verticalAlignment: 'center' },
                        this.$render("i-hstack", { gap: '0.5rem', verticalAlignment: 'center' },
                            this.$render("i-image", { width: 24, height: 24, url: tokenIconPath, fallbackUrl: scom_token_list_2.assets.fallbackUrl }),
                            this.$render("i-label", { class: "token-symbol", caption: token.symbol }))))));
            this.tokenMap.set(token.address || token.symbol, tokenElm);
            return tokenElm;
        }
        clearTokenList() {
            this.gridTokenList.clearInnerHTML();
            this.gridTokenList.append(this.$render("i-label", { class: 'text-center', caption: 'No tokens found', margin: { top: '1rem', bottom: '1rem' } }));
        }
        async renderTokenList(isSearch = false) {
            if (!this.gridTokenList)
                return;
            this.tokenMap = new Map();
            this.gridTokenList.clearInnerHTML();
            const tokenList = this.tokenDataListFiltered || [];
            if (this.supportValidAddress && isSearch && !tokenList.length && this.filterValue) {
                const token = await (0, utils_1.getTokenInfo)(this.filterValue, this.chainId);
                if (token) {
                    tokenList.push(token);
                }
            }
            if (this.supportValidAddress && this.isCustomTokenShown) {
                tokenList.push({
                    chainId: this.chainId,
                    ...utils_1.CUSTOM_TOKEN
                });
            }
            if (tokenList.length) {
                const tokenItems = tokenList.map((token) => this.renderToken(token));
                this.gridTokenList.append(...tokenItems);
            }
            else {
                this.clearTokenList();
            }
        }
        showModal() {
            if (!this.enabled)
                return;
            if (this.maxWidth) {
                this.mdCbToken.maxWidth = this.maxWidth;
            }
            else {
                const wapperWidth = this.wrapper.offsetWidth;
                this.mdCbToken.maxWidth = wapperWidth < 240 ? 240 : wapperWidth;
            }
            this.mdCbToken.style.width = "100%";
            if (this.minWidth)
                this.mdCbToken.minWidth = this.minWidth;
            this.pnlList.maxHeight = !this.maxHeight ? '300px' : this.maxHeight;
            if (this.background?.color)
                this.mdCbToken.background.color = this.background.color;
            this.mdCbToken.visible = !this.mdCbToken.visible;
        }
        hideModal() {
            this.mdCbToken.visible = false;
        }
        setActive(token) {
            if (this.currentToken && this.tokenMap.has(this.currentToken))
                this.tokenMap.get(this.currentToken).classList.remove('is-selected');
            const newToken = token.address || token.symbol;
            if (this.tokenMap.has(newToken))
                this.tokenMap.get(newToken).classList.add('is-selected');
            this.currentToken = newToken;
        }
        async onSelect(token) {
            this.token = token;
            this.setActive(token);
            if (this.onSelectToken)
                this.onSelectToken({ ...token });
            this.hideModal();
        }
        onSearch() {
            const value = this.edtSearch.value.toLowerCase();
            if (this.filterValue === value)
                return;
            this.filterValue = value;
            this.renderTokenList(true);
        }
        onOpenModal() {
            if (this.filterValue)
                this.renderTokenList(true);
            this.edtSearch.value = this.filterValue = '';
        }
        init() {
            this.classList.add(tokenSelect_css_1.default);
            super.init();
            this.onSelectToken = this.getAttribute('onSelectToken', true) || this.onSelectToken;
            this.token = this.getAttribute('token', true);
            const tokens = this.getAttribute('tokenList', true);
            if (tokens)
                this.tokenList = tokens;
            this.mdCbToken.visible = false;
        }
        render() {
            return (this.$render("i-panel", { id: "wrapper" },
                this.$render("i-modal", { id: "mdCbToken", showBackdrop: false, width: '100%', minWidth: 'auto', closeOnBackdropClick: true, popupPlacement: 'bottom', padding: { top: 0, left: 0, right: 0, bottom: 0 }, class: `box-shadow`, onOpen: this.onOpenModal.bind(this) },
                    this.$render("i-panel", null,
                        this.$render("i-panel", { position: 'relative', stack: { grow: '1' }, border: { bottom: { width: 1, style: 'solid', color: Theme.divider } } },
                            this.$render("i-hstack", { position: 'absolute', height: "100%", verticalAlignment: 'center', padding: { left: '0.5rem' } },
                                this.$render("i-icon", { width: 14, height: 14, name: "search", fill: Theme.text.primary })),
                            this.$render("i-input", { id: "edtSearch", width: "100%", height: 40, border: { width: 0 }, padding: { top: '0.25rem', right: '0.75rem', bottom: '0.25rem', left: '1.9375rem' }, background: { color: 'transparent' }, placeholder: 'Search name or paste address', onKeyUp: this.onSearch.bind(this) })),
                        this.$render("i-panel", { id: "pnlList", margin: { top: '0.25rem' }, padding: { top: 5, bottom: 5 }, overflow: { y: 'auto', x: 'hidden' }, maxWidth: '100%', border: { radius: 2 }, class: tokenSelect_css_1.scrollbarStyle },
                            this.$render("i-grid-layout", { id: 'gridTokenList', width: '100%', columnsPerRow: 1, templateRows: ['max-content'], class: 'is-combobox' }))))));
        }
    };
    TokenSelect = __decorate([
        (0, components_4.customElements)('token-select')
    ], TokenSelect);
    exports.TokenSelect = TokenSelect;
});
define("@scom/scom-token-input", ["require", "exports", "@ijstech/components", "@ijstech/eth-contract", "@scom/scom-token-input/index.css.ts", "@scom/scom-token-input/utils/index.ts", "@scom/scom-token-list", "@ijstech/eth-wallet"], function (require, exports, components_5, eth_contract_1, index_css_1, index_1, scom_token_list_3, eth_wallet_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CUSTOM_TOKEN = void 0;
    Object.defineProperty(exports, "CUSTOM_TOKEN", { enumerable: true, get: function () { return index_1.CUSTOM_TOKEN; } });
    const Theme = components_5.Styles.Theme.ThemeVars;
    const defaultTokenProps = {
        id: 'btnToken',
        height: '100%',
        caption: 'Select Token',
        rightIcon: { width: 14, height: 14, name: 'angle-down' },
        border: { radius: 0 },
        background: { color: 'transparent' },
        font: { color: Theme.input.fontColor },
        padding: {
            top: '0.25rem',
            bottom: '0.25rem',
            left: '0.5rem',
            right: '0.5rem',
        },
        class: index_css_1.buttonStyle
    };
    let ScomTokenInput = class ScomTokenInput extends components_5.Module {
        constructor(parent, options) {
            super(parent, options);
            this._isCommonShown = false;
            this._isSortBalanceShown = true;
            this._isBtnMaxShown = true;
            this._readOnly = false;
            this._tokenReadOnly = false;
            this._inputReadOnly = false;
            this._importable = false;
            this._isInputShown = true;
            this._isBalanceShown = true;
            this._tokenDataListProp = [];
            this._withoutConnected = false;
            this._supportValidAddress = false;
            this._isCustomTokenShown = false;
            this.sortToken = (a, b, asc) => {
                if (a.symbol.toLowerCase() < b.symbol.toLowerCase()) {
                    return -1;
                }
                if (a.symbol.toLowerCase() > b.symbol.toLowerCase()) {
                    return 1;
                }
                return 0;
            };
            this.onButtonClicked = this.onButtonClicked.bind(this);
        }
        static async create(options, parent) {
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
        get tokenDataListProp() {
            return this._tokenDataListProp ?? [];
        }
        set tokenDataListProp(value) {
            this._tokenDataListProp = value ?? [];
            if (this.type === 'button') {
                if (this.mdToken)
                    this.mdToken.tokenDataListProp = this.tokenDataListProp;
            }
        }
        get tokenListByChainId() {
            let list = [];
            const propList = this.tokenDataListProp.filter(f => !f.chainId || f.chainId === this.chainId);
            const nativeToken = scom_token_list_3.ChainNativeTokenByChainId[this.chainId];
            const tokens = scom_token_list_3.DefaultERC20Tokens[this.chainId];
            for (const token of propList) {
                const tokenAddress = token.address?.toLowerCase();
                if (!tokenAddress || tokenAddress === nativeToken?.symbol?.toLowerCase()) {
                    if (nativeToken)
                        list.push({ ...nativeToken, chainId: this.chainId });
                }
                else {
                    const tokenObj = tokens.find(v => v.address?.toLowerCase() === tokenAddress);
                    if (tokenObj)
                        list.push({ ...token, chainId: this.chainId });
                }
            }
            return list;
        }
        get tokenDataList() {
            let tokenList = this.tokenListByChainId?.length ? this.tokenListByChainId : scom_token_list_3.tokenStore.getTokenList(this.chainId);
            if (this.tokenDataListProp && this.tokenDataListProp.length) {
                tokenList = this.tokenDataListProp;
            }
            if (!this.tokenBalancesMap || !Object.keys(this.tokenBalancesMap).length) {
                this.tokenBalancesMap = scom_token_list_3.tokenStore.getTokenBalancesByChainId(this._chainId) || {};
            }
            return tokenList.map((token) => {
                const tokenObject = { ...token };
                const nativeToken = scom_token_list_3.ChainNativeTokenByChainId[this.chainId];
                if (nativeToken?.symbol && token.symbol === nativeToken.symbol) {
                    Object.assign(tokenObject, { isNative: true });
                }
                if (!eth_wallet_2.Wallet.getClientInstance().isConnected) {
                    Object.assign(tokenObject, {
                        balance: 0,
                    });
                }
                else if (this.tokenBalancesMap) {
                    Object.assign(tokenObject, {
                        balance: this.tokenBalancesMap[token.address?.toLowerCase() || token.symbol] || 0,
                    });
                }
                return tokenObject;
            }).sort(this.sortToken);
        }
        get onSelectToken() {
            return this._onSelectToken;
        }
        set onSelectToken(callback) {
            this._onSelectToken = callback;
        }
        get type() {
            return this._type ?? 'button';
        }
        set type(value) {
            if (value === this._type)
                return;
            this._type = value;
            if (this.btnToken)
                this.btnToken.width = value === 'button' ? "auto" : '100%';
            // this.onRefresh()
        }
        get title() {
            return this._title ?? '';
        }
        set title(value) {
            this._title = value;
            let labelEl;
            if (typeof value === 'string') {
                labelEl = new components_5.Label(undefined, {
                    caption: value,
                    font: { color: Theme.colors.primary.main, size: '1rem', bold: true },
                });
            }
            else {
                labelEl = value;
            }
            if (!this.pnlTitle)
                this.pnlTitle = new components_5.HStack();
            this.pnlTitle.clearInnerHTML();
            this.pnlTitle.appendChild(labelEl);
        }
        get token() {
            return this._token;
        }
        set token(value) {
            this._token = value;
            // this.onSelectFn(value)
            if (this.cbToken)
                this.cbToken.token = value;
            if (this.mdToken)
                this.mdToken.token = value;
            this.updateTokenUI();
        }
        get address() {
            return this._address;
        }
        set address(value) {
            this._address = value;
            if (!value) {
                this.token = null;
                return;
            }
            const tokenAddress = value.toLowerCase();
            let tokenObj = null;
            if (tokenAddress === index_1.CUSTOM_TOKEN.address.toLowerCase()) {
                tokenObj = index_1.CUSTOM_TOKEN;
            }
            else if (tokenAddress.startsWith('0x') && tokenAddress !== eth_contract_1.nullAddress) {
                tokenObj = scom_token_list_3.DefaultERC20Tokens[this.chainId]?.find(v => v.address?.toLowerCase() === tokenAddress);
            }
            else {
                const nativeToken = scom_token_list_3.ChainNativeTokenByChainId[this.chainId];
                tokenObj = (tokenAddress === eth_contract_1.nullAddress || nativeToken?.symbol?.toLowerCase() === tokenAddress) ? nativeToken : null;
            }
            this.token = tokenObj;
            if (!tokenObj)
                this.updateCustomToken();
        }
        get chainId() {
            return this._chainId;
        }
        set chainId(value) {
            this._chainId = value;
        }
        get isCommonShown() {
            return this._isCommonShown;
        }
        set isCommonShown(value) {
            this._isCommonShown = value;
            if (this.mdToken)
                this.mdToken.isCommonShown = value;
        }
        get isSortBalanceShown() {
            return this._isSortBalanceShown;
        }
        set isSortBalanceShown(value) {
            this._isSortBalanceShown = value;
            if (this.mdToken)
                this.mdToken.isSortBalanceShown = value;
        }
        get isBtnMaxShown() {
            return this._isBtnMaxShown;
        }
        set isBtnMaxShown(value) {
            this._isBtnMaxShown = value;
            if (this.btnMax)
                this.btnMax.visible = value;
        }
        get readOnly() {
            return this._readOnly;
        }
        set readOnly(value) {
            this._readOnly = value;
            if (this.btnToken) {
                this.btnToken.enabled = !value;
                this.btnToken.rightIcon.visible = !value;
            }
            if (this.btnMax)
                this.btnMax.enabled = !value;
            if (this.inputAmount)
                this.inputAmount.readOnly = value;
        }
        get tokenReadOnly() {
            return this._tokenReadOnly;
        }
        set tokenReadOnly(value) {
            this._tokenReadOnly = value;
            if (this.btnToken) {
                this.btnToken.enabled = !this._readOnly && !value;
                this.btnToken.rightIcon.visible = !this._readOnly && !value;
            }
        }
        get inputReadOnly() {
            return this._inputReadOnly;
        }
        set inputReadOnly(value) {
            this._inputReadOnly = value;
            if (this.inputAmount) {
                this.inputAmount.readOnly = value;
            }
        }
        get importable() {
            return this._importable;
        }
        set importable(value) {
            this._importable = value;
            if (this.mdToken)
                this.mdToken.importable = value;
        }
        get isInputShown() {
            return this._isInputShown;
        }
        set isInputShown(value) {
            this._isInputShown = value;
            if (this.inputAmount)
                this.inputAmount.visible = value;
            if (this.gridTokenInput)
                this.gridTokenInput.templateColumns = value ? ['50%', 'auto'] : ['auto'];
            if (this.pnlTokenBtn)
                this.pnlTokenBtn.horizontalAlignment = value ? 'end' : 'start';
        }
        get isBalanceShown() {
            return this._isBalanceShown;
        }
        set isBalanceShown(value) {
            this._isBalanceShown = value;
            if (this.pnlBalance)
                this.pnlBalance.visible = value;
        }
        get supportValidAddress() {
            return this._supportValidAddress;
        }
        set supportValidAddress(value) {
            this._supportValidAddress = value;
            if (this.cbToken)
                this.cbToken.supportValidAddress = value;
        }
        get isCustomTokenShown() {
            return this._isCustomTokenShown;
        }
        set isCustomTokenShown(value) {
            this._isCustomTokenShown = value;
            if (this.cbToken)
                this.cbToken.isCustomTokenShown = value;
        }
        get amount() {
            return this.inputAmount.value;
        }
        get placeholder() {
            return this.inputAmount?.placeholder ?? 'Enter an amount';
        }
        set placeholder(value) {
            this.inputAmount.placeholder = value ?? 'Enter an amount';
        }
        get value() {
            return this.inputAmount.value;
        }
        set value(value) {
            if (this.inputAmount)
                this.inputAmount.value = value;
        }
        get modalStyles() {
            return this._modalStyles;
        }
        set modalStyles(value) {
            this._modalStyles = value;
            if (value.maxWidth !== undefined) {
                if (this.cbToken)
                    this.cbToken.maxWidth = value.maxWidth;
                if (this.mdToken)
                    this.mdToken.maxWidth = value.maxWidth;
            }
            if (value.minWidth !== undefined) {
                if (this.cbToken)
                    this.cbToken.minWidth = value.minWidth;
                if (this.mdToken)
                    this.mdToken.minWidth = value.minWidth;
            }
            if (value.maxHeight !== undefined) {
                if (this.cbToken)
                    this.cbToken.maxHeight = value.maxHeight;
                if (this.mdToken)
                    this.mdToken.maxHeight = value.maxHeight;
            }
            if (value.background) {
                if (this.cbToken)
                    this.cbToken.background = value.background;
                if (this.mdToken)
                    this.mdToken.background = value.background;
            }
        }
        get tokenButtonStyles() {
            return this._tokenButtonStyles;
        }
        set tokenButtonStyles(value) {
            this._tokenButtonStyles = value;
            if (!this.btnToken)
                return;
            let tokenBtnProps = value ? { ...defaultTokenProps, ...value } : { ...defaultTokenProps };
            this.btnToken = new components_5.Button(this.pnlTokenBtn, tokenBtnProps);
            this.btnToken.onClick = this.onButtonClicked;
        }
        getBalance(token) {
            let tokenBalances = scom_token_list_3.tokenStore?.getTokenBalancesByChainId(this._chainId);
            if (token && tokenBalances && Object.keys(tokenBalances).length) {
                const address = (token.address || '').toLowerCase();
                let balance = address ? (tokenBalances[address] ?? (token.balance || 0)) : (tokenBalances[token.symbol] || 0);
                return balance;
            }
            return 0;
        }
        async onSetMax() {
            const balance = this.getBalance(this.token);
            this.inputAmount.value = new eth_contract_1.BigNumber(balance).dp(4, eth_contract_1.BigNumber.ROUND_DOWN).toString();
            if (this.onSetMaxBalance)
                this.onSetMaxBalance();
        }
        async onAmountChanged(target, event) {
            if (this.onInputAmountChanged)
                this.onInputAmountChanged(target, event);
        }
        onToggleFocus(value) {
            value ?
                this.gridTokenInput.classList.add('focus-style') :
                this.gridTokenInput.classList.remove('focus-style');
        }
        _handleFocus(event) {
            this.onToggleFocus(true);
            return super._handleFocus(event);
        }
        async updateCustomToken() {
            if (this.token || !this._address || !this.supportValidAddress || !this.chainId)
                return;
            const token = await (0, index_1.getTokenInfo)(this._address, this.chainId);
            if (token) {
                if (this.type === 'combobox' && this.cbToken && !this.cbToken.chainId) {
                    this.cbToken.chainId = this.chainId;
                }
                this.token = token;
            }
        }
        async renderTokenList(init) {
            if (this.type === 'combobox') {
                if (!this.cbToken)
                    return;
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
                }
                else {
                    this.cbToken.tokenList = [...this.tokenDataList];
                }
            }
            else {
                if (!this.mdToken)
                    return;
                if (!this.mdToken.isConnected)
                    await this.mdToken.ready();
                if (this.cbToken)
                    this.cbToken.visible = false;
                this.mdToken.tokenDataListProp = this.tokenDataListProp;
                if (this.mdToken.onRefresh)
                    this.mdToken.onRefresh();
            }
        }
        async updateTokenUI() {
            this.value = '';
            this.updateBalance();
            this.updateTokenButton();
        }
        async updateBalance() {
            if (!this.lbBalance)
                return;
            if (!this.lbBalance.isConnected)
                await this.lbBalance.ready();
            if (this.token) {
                const symbol = this.token?.symbol || '';
                const balance = this.getBalance(this.token);
                this.lbBalance.caption = `${(0, index_1.formatNumber)(balance, 6)} ${symbol}`;
            }
            else {
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
        updateTokenButton() {
            if (!this.btnToken)
                return;
            let token = this.token ? { ...this.token } : undefined;
            if (!token)
                token = (this.tokenDataList || []).find((v) => (v.address && v.address == this.token?.address) ||
                    v.symbol == this.token?.symbol);
            if (token) {
                const tokenIconPath = token.logoURI || scom_token_list_3.assets.tokenPath(token, this.chainId);
                this.btnToken.caption = `<i-hstack verticalAlignment="center" gap="0.5rem">
          <i-panel>
            <i-image width=${24} height=${24} url="${tokenIconPath}" fallbackUrl="${scom_token_list_3.assets.fallbackUrl}"></i-image>
          </i-panel>
          <i-label caption="${token?.symbol || ''}"></i-label>
        </i-hstack>`;
                this.btnMax.visible = this.isBtnMaxShown;
            }
            else {
                this.btnToken.caption = 'Select Token';
                this.btnMax.visible = false;
            }
        }
        async onButtonClicked() {
            // this.onRefresh();
            if (this.type === 'combobox') {
                await this.renderTokenList(true);
                this.cbToken.showModal();
            }
            else {
                if (this.mdToken.chainId !== this.chainId) {
                    this.mdToken.chainId = this.chainId;
                }
                this.mdToken.tokenDataListProp = this.tokenDataListProp;
                this.mdToken.showModal();
            }
        }
        async onSelectFn(token) {
            if (JSON.stringify(this._token) === JSON.stringify(token))
                return;
            if (this.onChanged) {
                this.onChanged(token);
            }
            this._token = token;
            this.updateTokenUI();
            this.onSelectToken && this.onSelectToken(token);
        }
        init() {
            this.classList.add(index_css_1.default);
            super.init();
            const tokenButtonStyles = this.getAttribute('tokenButtonStyles', true);
            if (tokenButtonStyles)
                this._tokenButtonStyles = tokenButtonStyles;
            let tokenBtnProps = tokenButtonStyles ? { ...defaultTokenProps, ...tokenButtonStyles } : { ...defaultTokenProps };
            this.btnToken = new components_5.Button(this.pnlTokenBtn, tokenBtnProps);
            this.btnToken.onClick = this.onButtonClicked;
            this.onInputAmountChanged = this.getAttribute('onInputAmountChanged', true) || this.onInputAmountChanged;
            this.onSetMaxBalance = this.getAttribute('onSetMaxBalance', true) || this.onSetMaxBalance;
            this.onSelectToken = this.getAttribute('onSelectToken', true) || this.onSelectToken;
            this.title = this.getAttribute('title', true, '');
            this._withoutConnected = this.getAttribute('withoutConnected', true, false);
            this.chainId = this.getAttribute('chainId', true);
            const address = this.getAttribute('address', true);
            if (address)
                this.address = address;
            const tokenDataListProp = this.getAttribute('tokenDataListProp', true);
            if (tokenDataListProp)
                this.tokenDataListProp = tokenDataListProp;
            const token = this.getAttribute('token', true);
            if (token)
                this.token = token;
            this.readOnly = this.getAttribute('readOnly', true, false);
            this.tokenReadOnly = this.getAttribute('tokenReadOnly', true, false);
            this.inputReadOnly = this.getAttribute('inputReadOnly', true, false);
            this.isBtnMaxShown = this.getAttribute('isBtnMaxShown', true, true);
            this.type = this.getAttribute('type', true, 'button');
            if (this.type === 'button') {
                this.isCommonShown = this.getAttribute('isCommonShown', true, false);
                this.isSortBalanceShown = this.getAttribute('isSortBalanceShown', true, true);
                this.importable = this.getAttribute('importable', true, false);
            }
            this.isInputShown = this.getAttribute('isInputShown', true, true);
            this.isBalanceShown = this.getAttribute('isBalanceShown', true, true);
            this.placeholder = this.getAttribute('placeholder', true);
            const supportValidAddress = this.getAttribute('supportValidAddress', true);
            if (supportValidAddress != null)
                this.supportValidAddress = supportValidAddress;
            const isCustomTokenShown = this.getAttribute('isCustomTokenShown', true);
            if (isCustomTokenShown != null)
                this.isCustomTokenShown = isCustomTokenShown;
            const value = this.getAttribute('value', true);
            if (value !== undefined)
                this.value = value;
            this.pnlTopSection.visible = this.isBalanceShown;
            this.pnlTopSection.margin = { bottom: this.pnlTopSection.visible ? '0.5rem' : 0 };
            const modalStyles = this.getAttribute('modalStyles', true);
            if (modalStyles)
                this.modalStyles = modalStyles;
            document.addEventListener('click', (event) => {
                const target = event.target;
                const tokenInput = target.closest('#gridTokenInput');
                if (!tokenInput || !tokenInput.isSameNode(this.gridTokenInput))
                    this.onToggleFocus(false);
                else
                    this.onToggleFocus(true);
            });
        }
        render() {
            return (this.$render("i-hstack", { width: '100%', height: "100%", border: { radius: 'inherit', style: 'none' }, verticalAlignment: "center" },
                this.$render("i-vstack", { width: '100%', height: "100%", margin: { top: '0.5rem', bottom: '0.5rem' }, border: { radius: 'inherit', style: 'none' }, justifyContent: "center" },
                    this.$render("i-hstack", { id: "pnlTopSection", horizontalAlignment: 'space-between', verticalAlignment: 'center', width: '100%' },
                        this.$render("i-hstack", { id: "pnlTitle", gap: "4px" }),
                        this.$render("i-hstack", { id: "pnlBalance", horizontalAlignment: 'end', verticalAlignment: 'center', gap: '0.5rem', margin: { bottom: '0.5rem' }, opacity: 0.6 },
                            this.$render("i-label", { caption: 'Balance:', font: { size: '0.875rem' } }),
                            this.$render("i-label", { id: 'lbBalance', font: { size: '0.875rem' }, caption: "0" }))),
                    this.$render("i-grid-layout", { id: 'gridTokenInput', templateColumns: ['50%', 'auto'], background: { color: Theme.input.background }, font: { color: Theme.input.fontColor }, border: { radius: 'inherit', style: 'none' }, verticalAlignment: 'center', lineHeight: 1.5715, width: '100%', gap: { column: '0.5rem' } },
                        this.$render("i-input", { id: 'inputAmount', width: '100%', height: '100%', font: { size: 'inherit' }, inputType: 'number', padding: { left: 0, right: 0, top: 0, bottom: 0 }, border: { style: 'none' }, placeholder: 'Enter an amount', onChanged: this.onAmountChanged }),
                        this.$render("i-panel", { id: "pnlSelection", width: '100%' },
                            this.$render("i-hstack", { id: "pnlTokenBtn", verticalAlignment: "center", gap: "0.25rem" },
                                this.$render("i-button", { id: 'btnMax', visible: false, caption: 'Max', height: '100%', background: { color: Theme.colors.success.main }, font: { color: Theme.colors.success.contrastText }, padding: {
                                        top: '0.25rem',
                                        bottom: '0.25rem',
                                        left: '0.5rem',
                                        right: '0.5rem',
                                    }, onClick: () => this.onSetMax() })),
                            this.$render("token-select", { id: "cbToken", width: "100%", onSelectToken: this.onSelectFn }),
                            this.$render("i-scom-token-modal", { id: "mdToken", width: "100%", onSelectToken: this.onSelectFn }))))));
        }
    };
    ScomTokenInput = __decorate([
        components_5.customModule,
        (0, components_5.customElements)('i-scom-token-input')
    ], ScomTokenInput);
    exports.default = ScomTokenInput;
});
