/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2016 RtF-US
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || require("sinon-chrome");

fluid.defaults("gpii.chrome.extensionHolder", {
    gradeNames: "fluid.modelComponent",
    extensionId: "",
    members: {
        extensionInstance: null
    },
    events: {
        onError: null
    },
    model: {
        extensionEnabled: undefined
    },
    invokers: {
        switchStatus: {
            funcName: "gpii.chrome.extensionHolder.switchStatus",
            args: "{that}"
        },
        setup: {
            funcName: "gpii.chrome.extensionHolder.setup",
            args: ["{that}", "{arguments}.0"]
        }
    },
    listeners: {
        onCreate: {
            funcName: "gpii.chrome.extensionHolder.populate",
            args: "{that}"
        }
    },
    modelListeners: {
        extensionEnabled: {
            func: "{that}.switchStatus",
            excludeSource: "init"
        }
    }
});

gpii.chrome.extensionHolder.setup = function (that, extInfo) {
    if (chrome.runtime.lastError) {
        fluid.log("Could not get extensionInfo, error was:",
        chrome.runtime.lastError.message);
        that.events.onError.fire(chrome.runtime.lastError);
    } else {
        that.extensionInstance = extInfo;
        that.applier.change("extensionEnabled", that.extensionInstance.enabled);
    }
};

gpii.chrome.extensionHolder.populate = function (that) {
    chrome.management.get(that.options.extensionId, that.setup);
};

gpii.chrome.extensionHolder.switchStatus = function (that) {
    that.extensionInstance.enabled = that.model.extensionEnabled;
    chrome.management.setEnabled(that.extensionInstance.id, that.model.extensionEnabled, function () {
        // TODO: What can go wrong here?
        if (chrome.runtime.lastError) {
            fluid.log("Could not get extensionInfo, error was:",
            chrome.runtime.lastError.message);
            that.events.onError.fire(chrome.runtime.lastError);
        };
    });
};
