export interface UIConfig {
    fontSize: string;
    tooltipFontSize: string;
    fontFamily: string;
    textColor: string;
    padding: number;
    modalBackgroundColor: number;
    modalAlpha: number;
    buttonColor: number;
    buttonHoverColor: number;
    buttonDisabledColor: number;
    upgradesButtonColor: number;
    upgradesButtonHoverColor: number;
    fishingButtonColor: number;
    fishingButtonHoverColor: number;
    goldColor: string;
    cardWidth: number;
    cardHeight: number;
    floatingTextDuration: number;
    floatingTextSpeed: number;
    floatingTextFontSize: string;
    footerHeight: number;
    footerBackgroundColor: number;
    Header: {
        backgroundColor: number;
        borderColor: number;
        borderWidth: number;
        padding: number;
        width: number;
        height: number;
    };
}

export interface ModalConfig {
    overlayAlpha: number;
    backgroundColor: number;
    backgroundAlpha: number;
    titleMarginTop: number;
    titleMarginBottom: number;
    titleFontSize: string;
    titleFontHeight: number;
    titleColor: string;
    closeButtonSize: number;
    closeButtonPadding: number;
    closeButtonFontSize: string;
    closeButtonColor: string;
    cardBackgroundColor: number;
    cardBackgroundAlpha: number;
    cardBorderColor: number;
    cardBorderWidth: number;
    cardPadding: number;
    cardTitleFontSize: string;
    cardTitleFontHeight: number;
    cardTitleColor: string;
    cardTextFontSize: string;
    cardTextFontHeight: number;
    cardTextColor: string;
    buttonHeight: number;
    buttonColor: number;
    buttonHoverColor: number;
    buttonBorderColor: number;
    buttonBorderWidth: number;
    buttonFontSize: string;
    buttonTextColor: string;

    fishingModal: {
        width: number;
        height: number;
        cardWidth: number;
        cardHeight: number;
        cardSpacing: number;
    };

    upgradesModal: {
        width: number;
        height: number;
        cardWidth: number;
        cardHeight: number;
        cardSpacing: number;
        columns: number;
    };

    resultsModal: {
        width: number;
        height: number;
    };

    confirmationModal: {
        width: number;
        height: number;
        titleFontSize: string;
        textFontSize: string;
        buttonWidth: number;
        buttonHeight: number;
    };
}

export interface DepthLayersConfig {
    background: number;
    aquarium: number;
    aquariumBorders: number;
    visitorFloor: number;
    visitors: number;
    pool: number;
    hookLine: number;
    hook: number;
    staminaIndicator: number;
    ui: number;
    uiButton: number;
    tooltip: number;
    modalOverlay: number;
    modal: number;
    floatingText: number;
}
