/**
 *
 * TODO:
 *
 * Add support for arrow movement.
 * Add support for going to option based on character pressed.
 * Add only crucial styles on the defaults and the rest on the main.css
 * Write unit tests.
 * Make container close on bur, and fix minor bugs
 * Clean up and refactor.
 * Write documentation.
 *
 */
(function(global) {

    "use strict";

    var APP = global.customformsjs = global.customformsjs || {},
        module = APP.module = APP.module || {},

        /**
         * Module default settings.
         *
         * @constant
         * @default
         * @access private
         * @memberof customformsjs.module.Choice
         */
        DEFAULTS = {
            active: false,
            ready: function() {},
            customEle: 'a',
            containerEle: 'div',
            autoHide: false,
            classPrefix: 'custom-',
            hideCss: {
                opacity: '0',
                filter: 'alpha(opacity=0)',
                position: 'absolute',
                top: '0px',
                left: '0px',
                '-moz-opacity': '0',
                '-khtml-opacity': '0'
            },
            elCss: {
                display: "block",
                '-webkit-appearance': 'none',
                '-moz-appearance': 'none'
            },
            customContainerCss: {
                position: 'relative'
            },
            customElCss: {
                display: "block",
                overflow: "hidden",
                'white-space': "nowrap",
                'text-overflow': "ellipsis"
            },
            customListCss: {},
            customListItemCss: {}
        };


    /**
     * Add support for styling select fields.
     * A custom element is added behind the browser default select field,
     * and the select field is made transparent to create the illusion of a
     * custom element. Options can be passed to extend the defaults.
     *
     * @module Choice
     * @param {Object} obj Options to initialize Choice module.
     * @name customformsjs.module.Choice
     * @example
     * var DEFAULTS = {
     *      active: true, // active by default
     *      ready: function() {}, // callback when module is ready.
     *      customEle: 'a', // default element for handle.
     *      containerEle: 'div', // default element for container.
     *      autoHide: true, // will auto hide html element by default
     *      classPrefix: 'custom-', // prefix used for class.
     *      hideCss: { // styles can be overwritten or added.
     *          opacity: '0',
     *          filter: 'alpha(opacity=0)',
     *          position: 'absolute',
     *          top: '0px',
     *          left: '0px',
     *          '-moz-opacity': '0', *          '-khtml-opacity': '0'
     *      },
     *      elCss: { // styles can be overwritten or added.
     *          display: "block",
     *          '-webkit-appearance': 'none',
     *          '-moz-appearance': 'none'
     *      },
     *      customContainerCss: { // styles can be overwritten or added.
     *          position: 'relative'
     *      },
     *      customElCss: { // styles can be overwritten or added.
     *          display: "block",
     *          overflow: "hidden",
     *          'white-space': "nowrap",
     *          'text-overflow': "ellipsis"
     *      },
     *      element: obj, // select input field.
     *      events: [], // custom events can be added.
     *      validators: [] // custom validators can be added.
     * };
     *
     * customformsjs.module.Choice(DEFAULTS);
     *
     * @returns {Object} Returns an Instance of module Choice.
     */
    module.Choice = function(obj) {

        var instance = false;

        var SETTINGS = obj ? $.extend(true, {}, DEFAULTS, obj) : DEFAULTS,
            $el = $(SETTINGS.element),
            $customEl = null,
            $customContainer = null,
            $customList = null,
            _id = DEFAULTS.classPrefix + ($el.attr('id') || $el.attr('name')),
            _class = DEFAULTS.classPrefix + 'choice',
            _containerClass = _class + '-container',

            attachEvents = function() {
                var $listItems = $customList.find("li");

                $el.focusin(function() {
                    $customContainer.addClass("focus");
                })
                    .focusout(function() {
                        $customContainer.removeClass("focus");
                    })
                    .change(function() {
                        instance.validate();
                    });


                $customContainer.click(function(e) {
                    e.preventDefault();
                    $customList.toggleClass("open");
                });

                $listItems.click(function() {
                    $listItems.removeClass("selected");
                    $(this).addClass("selected");

                    instance.validate();
                });
            };

        if (SETTINGS.active) {

            SETTINGS.validators = SETTINGS.validators || [];

            /**
             * Initializer for module. Will create custom elements and apply
             * default styles to it. Here will also be browser specific features.
             * Choice module works by adding a custom element behind the browser
             * select form field and making it transparent.
             *
             * @function
             * @memberof customformsjs.module.Choice
             */
            SETTINGS.init = function() {
                // hide element
                if (SETTINGS.autoHide) {
                    $el.css(DEFAULTS.hideCss);
                }

                // create custom element
                $customContainer = $("<" + SETTINGS.containerEle + "/>");

                // setup attr and styles to container
                $customContainer.attr({
                    id: _id + '-container',
                    'class': _containerClass
                }).css(SETTINGS.customContainerCss);

                // create custom element
                $customEl = $("<" + SETTINGS.customEle + "/>");

                // setup attr and styles to custom element
                $customEl.attr({
                    id: _id,
                    'class': _class
                }).css(SETTINGS.customElCss);

                // add container before element
                $el.before($customContainer);

                // move element inside container
                $el.appendTo($customContainer);

                // move custom element inside container
                $customContainer.append($customEl);


                // TODO: Create a list ul and append before $customEl with li matching the options on the select
                // While doing that check for property 'selected' and 'value' and 'disabled' and do similar iplementation on those
                $customList = $("<ul />");
                $customList.css(SETTINGS.customListCss);

                $el.find('option').each(function() {
                    var $customListItem = $("<li />"),
                        $option = $(this);


                    if ($el.val() === $option.val()) {
                        $customEl.html($option.html());
                        $customListItem.addClass("selected");
                    }

                    $customListItem.html($option.html()).attr("customValue", $option.val());
                    $customListItem.css(SETTINGS.customListItemCss);
                    $customList.append($customListItem);
                });

                $customContainer.append($customList);

                SETTINGS.ready();
            };

            instance = new APP.BaseField(SETTINGS);

            /**
             * Custom validator is added to find wich option is selected and get its text value.
             * Applying the option value the custom element as a text node.
             *
             * @function
             * @memberof customformsjs.module.Choice
             */
            instance.bind('validate', function() {
                var _selected = $customList.find('.selected'),
                    _selectedText = _selected.text() || $el.find('option').first().text();

                $customEl.html(_selectedText);
                $el.val(_selected.attr('customValue'));
            });

            instance.validate();
            attachEvents();

        }

        return instance;
    };

    /**
     * Blueprint used to allow custom field creation.
     * Element must be an object with a tagname 'select'
     *
     * @property {Object} blueprint used to see if element meet module requirements.
     * @memberof customformsjs.module.Choice
     */
    module.Choice.blueprint = {
        tagName: 'select',
        filter: {
            select: {
                customType: 'list-select'
            }
        }
    };

}(this));
