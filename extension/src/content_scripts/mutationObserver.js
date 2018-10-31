/*
 * GPII Chrome Extension for Google Chrome
 *
 * Copyright 2018 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/GPII/gpii-chrome-extension/blob/master/LICENSE.txt
 */

/* global fluid, gpii */
"use strict";

(function ($, fluid) {

    /*
     * Provides a grade for creating and interacting with a Mutation Observer to listen/respond to DOM changes.
     */
    fluid.defaults("gpii.chrome.mutationObserver", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            onNodeAdded: null,
            onNodeRemoved: null,
            onAttributeChanged: null
        },
        listeners: {
            "onDestroy.disconnect": "{that}.disconnect"
        },
        members: {
            observer: {
                expander: {
                    func: "{that}.createObserver"
                }
            }
        },
        defaultObserveConfig: {
            attributes: true,
            childList: true,
            subtree: true
        },
        invokers: {
            observe: {
                funcName: "gpii.chrome.mutationObserver.observe",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            },
            disconnect: {
                "this": "{that}.observer",
                method: "disconnect"
            },
            takeRecords: {
                "this": "{that}.observer",
                method: "takeRecords"
            },
            createObserver: {
                funcName: "gpii.chrome.mutationObserver.createObserver",
                args: ["{that}"]
            }
        }
    });

    /**
     * A Mutation Observer; allows for tracking changes to the DOM.
     * A mutation observer is created with a callback function, configured through its observe` method.
     * See: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
     *
     * @typedef {Object} MutationObserver
     */

    /**
     * Instantiates a mutation observer, defining the callback function which relays the observations to component
     * events. The configuration passed to the observe function will determine what mutations are observed and what
     * information is returned. See `gpii.chrome.mutationObserver.observe` about configuring the mutation observer.
     *
     * Event Mapping:
     * onNodeAdded - fired for each added node, includes the node and mutation record
     * onNodeRemoved - fired for each removed node, includes the node and mutation record
     * onAttributeChanged - fired for each attribute change, includes the node and mutation record
     *
     * @param {Component} that - an instance of `gpii.chrome.mutationObserver
     *
     * @return {MutationObserver} - the created mutation observer`
     */
    gpii.chrome.mutationObserver.createObserver = function (that) {
        var observer = new MutationObserver(function (mutationRecords) {
            mutationRecords.forEach(function (mutationRecord) {
                mutationRecord.addedNodes.forEach(function (node) {
                    that.events.onNodeAdded.fire(node, mutationRecord);
                });
                mutationRecord.removedNodes.forEach(function (node) {
                    that.events.onNodeRemoved.fire(node, mutationRecord);
                });
                if (mutationRecord.type === "attributes") {
                    that.events.onAttributeChanged.fire(mutationRecord.target, mutationRecord);
                }
            });
        });

        return observer;
    };

    /**
     * Starts observing the DOM changes. Optionally takes in a target and configuration for setting up the specific
     * observation. The observe method may be called multiple times; however, if the same observer is set on the same
     * node, the old one will be replaced. If an observation is disconnected, the observe method will need to be called
     * again to re-instate the mutation observation.
     *
     * @param {Component} that - an instance of `gpii.chrome.mutationObserver`
     * @param {DOMElement|jQuery} target - a DOM element or jQuery element to be observed. By default the component's
     *                                     container element is used.
     * @param {Object} options - config options to pass to the observations. This specifies which mutations should be
     *                           reported. See: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
     *                           By default the config at `that.options.defaultObserveConfig` is used.
     */
    gpii.chrome.mutationObserver.observe = function (that, target, options) {
        target = fluid.unwrap(target || that.container);
        that.observer.observe(target, options || that.options.defaultObserveConfig);
    };


})(jQuery, fluid);
