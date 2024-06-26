import React from 'react';
import { create } from 'jss';
import rtl from 'jss-rtl';

import {
    MuiThemeProvider,
    StylesProvider,
    createMuiTheme,
    jssPreset,
} from '@material-ui/core/styles';
import i18n from "i18next";

const jss = create({ plugins: [...jssPreset().plugins, rtl()] });


function HOCTranslateOrientationUI(Component) {
    function TranslateOrientationUI(props) {
        // JssProvider allows customizing the JSS styling solution.
        return (
            <StylesProvider jss={jss}>

                <MuiThemeProvider theme={createMuiTheme({
                    direction: i18n.dir()
                })}>
                    <Component {...props} />
                </MuiThemeProvider>
            </StylesProvider>
        );
    }

    return TranslateOrientationUI;
}

export default HOCTranslateOrientationUI;