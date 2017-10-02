'use strict';
/**
 * Constants Module
 */
module.exports = {
    /**
     * Primary Color from Material Palette.
     * @return {string}
     */  
    PrimaryColor: 'blue_grey',
    
    /**
     * Secondary Color from Material Palette.
     * @return {string}
     */
    SecondaryColor: 'indigo',
    
    /**
     * Page Title to use.
     * @return {string}
     */
    Title: 'JAR - Client',

    /**
     * Protocol To Handle
     * @return {string}
     */
    Protocol:'jarclient',

    /**
     * Running as in Debug mode, or as a packaged application
     * @return {boolean}
     */
    DebugMode: (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath))

};